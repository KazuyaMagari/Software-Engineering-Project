import pool from '../config/database';

export interface ITask {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  status: 'Open' | 'In progress' | 'Review' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High';
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export class Task {
  /**
   * Get all tasks for a user by email
   */
  static async findByUserEmail(email: string): Promise<ITask[]> {
    try {
      const result = await pool.query(
        `SELECT tasks.* FROM tasks
         JOIN users ON tasks.creator_id = users.id
         WHERE users.email = $1
         ORDER BY tasks.due_date ASC`,
        [email]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Create a new task
   */
  static async create(
    creator_id: string,
    title: string,
    description?: string,
    priority?: string,
    status?: string,
    due_date?: string
  ): Promise<ITask> {
    try {
      const result = await pool.query(
        `INSERT INTO tasks (creator_id, title, description, priority, status, due_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [creator_id, title, description || null, priority || 'Medium', status || 'Open', due_date || null]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update task status
   */
  static async updateStatus(taskId: string, status: string): Promise<ITask> {
    try {
      const result = await pool.query(
        'UPDATE tasks SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, taskId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Update task (all fields)
   */
  static async update(
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: string;
      status?: string;
      due_date?: string;
    }
  ): Promise<ITask> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(updates.title);
      }
      if (updates.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(updates.description || null);
      }
      if (updates.priority !== undefined) {
        fields.push(`priority = $${paramIndex++}`);
        values.push(updates.priority);
      }
      if (updates.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(updates.status);
      }
      if (updates.due_date !== undefined) {
        fields.push(`due_date = $${paramIndex++}`);
        values.push(updates.due_date || null);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(taskId);

      const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   */
  static async delete(taskId: string): Promise<boolean> {
    try {
      const result = await pool.query('DELETE FROM tasks WHERE id = $1', [taskId]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
}
