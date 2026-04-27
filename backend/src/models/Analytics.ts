import { pool } from '../config/database'

export class Analytics {
  /**
   * Get basic task statistics for a user
   */
  static async getTaskStats(email: string) {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'In progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'Open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'Review' THEN 1 END) as review,
        COUNT(CASE WHEN status = 'Overdue' THEN 1 END) as overdue,
        ROUND(100.0 * COUNT(CASE WHEN status = 'Completed' THEN 1 END) / NULLIF(COUNT(*), 0), 1) as completion_rate
      FROM tasks
      WHERE creator_id = (
        SELECT id FROM users WHERE email = $1
      )
    `
    const result = await pool.query(query, [email])
    return result.rows[0] || null
  }

  /**
   * Get breakdown of tasks by status
   */
  static async getStatusBreakdown(email: string) {
    const query = `
      SELECT 
        status,
        COUNT(*) as count,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM tasks
      WHERE creator_id = (
        SELECT id FROM users WHERE email = $1
      )
      GROUP BY status
      ORDER BY count DESC
    `
    const result = await pool.query(query, [email])
    return result.rows
  }

  /**
   * Get breakdown of tasks by priority
   */
  static async getPriorityBreakdown(email: string) {
    const query = `
      SELECT 
        priority,
        COUNT(*) as count,
        ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage
      FROM tasks
      WHERE creator_id = (
        SELECT id FROM users WHERE email = $1
      )
      GROUP BY priority
      ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 END
    `
    const result = await pool.query(query, [email])
    return result.rows
  }

  /**
   * Get completion trends over the last N days
   */
  static async getCompletionTrends(email: string, days: number = 30) {
    const query = `
      WITH date_series AS (
        SELECT 
          DATE(CURRENT_DATE - INTERVAL '1 day' * generate_series(0, $2))::date as date
      ),
      completed_per_day AS (
        SELECT 
          DATE(completed_at)::date as date,
          COUNT(*) as completed
        FROM tasks
        WHERE creator_id = (
          SELECT id FROM users WHERE email = $1
        ) AND status = 'Completed' AND completed_at IS NOT NULL
        GROUP BY DATE(completed_at)
      )
      SELECT 
        ds.date,
        COALESCE(cpd.completed, 0) as completed,
        SUM(COALESCE(cpd.completed, 0)) OVER (ORDER BY ds.date) as cumulative
      FROM date_series ds
      LEFT JOIN completed_per_day cpd ON ds.date = cpd.date
      ORDER BY ds.date DESC
    `
    const result = await pool.query(query, [email, days])
    return result.rows.reverse() // Return chronological order
  }

  /**
   * Get detailed performance metrics for a user
   */
  static async getPerformanceMetrics(email: string) {
    const query = `
      SELECT 
        ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600)::numeric, 1) as average_completion_time,
        COUNT(CASE WHEN priority = 'High' AND status = 'Completed' THEN 1 END) as high_priority_completed,
        COUNT(CASE WHEN priority = 'High' AND status != 'Completed' THEN 1 END) as high_priority_pending,
        COUNT(CASE WHEN status = 'Completed' AND completed_at <= due_date THEN 1 END) as on_time_completion,
        COUNT(CASE WHEN status = 'Completed' AND completed_at > due_date THEN 1 END) as late_completion
      FROM tasks
      WHERE creator_id = (
        SELECT id FROM users WHERE email = $1
      )
    `
    const result = await pool.query(query, [email])
    return result.rows[0] || null
  }

  /**
   * Get team performance metrics (all users' aggregated data)
   */
  static async getTeamPerformance() {
    const query = `
      SELECT 
        u.email,
        COUNT(t.id) as total_tasks,
        COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) as completed_tasks,
        ROUND(100.0 * COUNT(CASE WHEN t.status = 'Completed' THEN 1 END) / NULLIF(COUNT(t.id), 0), 1) as completion_rate,
        ROUND(AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at)) / 3600)::numeric, 1) as average_completion_time
      FROM users u
      LEFT JOIN tasks t ON u.id = t.creator_id
      GROUP BY u.id, u.email
      HAVING COUNT(t.id) > 0
      ORDER BY completion_rate DESC
    `
    const result = await pool.query(query)
    return result.rows
  }
}
