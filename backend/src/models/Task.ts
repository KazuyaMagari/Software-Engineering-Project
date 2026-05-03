import pool from '../config/database';

export interface ITask {
  id: string;
  creator_id: string;
  owner_id?: string;
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
   * Check whether the authenticated user owns the task.
   */
  static async isOwner(taskId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM tasks WHERE id = $1 AND creator_id = $2',
      [taskId, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Check whether the authenticated user can access the task.
   */
  static async hasAccess(taskId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1
       FROM tasks t
       LEFT JOIN task_shares ts
         ON ts.task_id = t.id
        AND ts.shared_with_id = $2
       WHERE t.id = $1
         AND (t.creator_id = $2 OR ts.shared_with_id IS NOT NULL)`,
      [taskId, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Check whether the authenticated user can edit the task.
   */
  static async isOwnerOrEditor(taskId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT 1
       FROM tasks t
       LEFT JOIN task_shares ts
         ON ts.task_id = t.id
        AND ts.shared_with_id = $2
       WHERE t.id = $1
         AND (t.creator_id = $2 OR ts.permission = 'edit')`,
      [taskId, userId]
    );
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Get all tasks for a user by email with optional search (deprecated - use findByUserId)
   */
  static async findByUserEmail(email: string, search?: string): Promise<ITask[]> {
    try {
      let query = `SELECT tasks.*, tasks.creator_id AS owner_id FROM tasks
                   JOIN users ON tasks.creator_id = users.id
                   WHERE users.email = $1`;
      const values: any[] = [email];

      // Search in title and description
      if (search && search.trim()) {
        query += ` AND (tasks.title ILIKE $2 OR tasks.description ILIKE $2)`;
        values.push(`%${search}%`);
      }

      query += ` ORDER BY tasks.due_date ASC`;

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Get all tasks for a user by user ID with optional search
   */
  static async findByUserId(userId: string, search?: string): Promise<ITask[]> {
    try {
      let query = `SELECT tasks.*, tasks.creator_id AS owner_id FROM tasks WHERE creator_id = $1`;
      const values: any[] = [userId];

      // Search in title and description
      if (search && search.trim()) {
        query += ` AND (title ILIKE $2 OR description ILIKE $2)`;
        values.push(`%${search}%`);
      }

      query += ` ORDER BY due_date ASC NULLS LAST`;

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching tasks by user ID:', error);
      throw error;
    }
  }

  /**
   * Get task by ID and verify it belongs to the user
   */
  static async findByIdAndUserId(taskId: string, userId: string): Promise<ITask | null> {
    try {
      const result = await pool.query(
        'SELECT tasks.*, tasks.creator_id AS owner_id FROM tasks WHERE id = $1 AND creator_id = $2',
        [taskId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching task by ID and user ID:', error);
      throw error;
    }
  }

  /**
   * Get a task if the authenticated user can access it.
   */
  static async findById(taskId: string, userId: string): Promise<ITask | null> {
    try {
      const result = await pool.query(
        `SELECT t.*, t.creator_id AS owner_id
         FROM tasks t
         LEFT JOIN task_shares ts
           ON ts.task_id = t.id
          AND ts.shared_with_id = $2
         WHERE t.id = $1
           AND (t.creator_id = $2 OR ts.shared_with_id IS NOT NULL)
         LIMIT 1`,
        [taskId, userId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching task by ID:', error);
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
   * Update task status (with user verification)
   */
  static async updateStatus(taskId: string, status: string, userId: string): Promise<ITask> {
    try {
      // Verify the task can be edited by the user
      const canEdit = await this.isOwnerOrEditor(taskId, userId);
      if (!canEdit) {
        throw new Error('Task not found or unauthorized');
      }

      const result = await pool.query(
        `UPDATE tasks
         SET status = $1::varchar,
             completed_at = CASE WHEN $1::varchar = 'Completed' THEN CURRENT_TIMESTAMP ELSE NULL END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *, creator_id AS owner_id`,
        [status, taskId]
      );
      
      if (!result.rows[0]) {
        throw new Error('Failed to update task');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Update task (all fields) with user verification
   */
  static async update(
    taskId: string,
    userId: string,
    updates: {
      title?: string;
      description?: string;
      priority?: string;
      status?: string;
      due_date?: string;
    }
  ): Promise<ITask> {
    try {
      // Verify the task can be edited by the user
      const canEdit = await this.isOwnerOrEditor(taskId, userId);
      if (!canEdit) {
        throw new Error('Task not found or unauthorized');
      }

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
        const statusParam = `$${paramIndex++}`;
        fields.push(`status = ${statusParam}::varchar`);
        fields.push(`completed_at = CASE WHEN ${statusParam}::varchar = 'Completed' THEN CURRENT_TIMESTAMP ELSE NULL END`);
        values.push(updates.status);
      }
      if (updates.due_date !== undefined) {
        fields.push(`due_date = $${paramIndex++}`);
        values.push(updates.due_date || null);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(taskId);

      const query = `UPDATE tasks SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *, creator_id AS owner_id`;
      const result = await pool.query(query, values);
      
      if (!result.rows[0]) {
        throw new Error('Failed to update task');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task (with user verification)
   */
  static async delete(taskId: string, userId: string): Promise<boolean> {
    try {
      // Verify the task belongs to the user
      const isOwner = await this.isOwner(taskId, userId);
      if (!isOwner) {
        throw new Error('Task not found or unauthorized');
      }

      const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND creator_id = $2', [taskId, userId]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Get all tasks accessible by a user (own + shared) with creator email
   */
  static async findAccessibleTasks(userId: string, search?: string): Promise<any[]> {
    try {
      let query = `
        SELECT t.*, t.creator_id AS owner_id, u.email as creator_email, 'owner'::text as access_permission FROM tasks t
        INNER JOIN users u ON t.creator_id = u.id
        WHERE t.creator_id = $1
      `;
      const values: any[] = [userId];
      let paramIndex = 2;

      if (search && search.trim()) {
        query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
        values.push(`%${search}%`);
        paramIndex++;
      }

      query += `
        UNION
        SELECT t.*, t.creator_id AS owner_id, u.email as creator_email, ts.permission as access_permission FROM tasks t
        INNER JOIN task_shares ts ON t.id = ts.task_id
        INNER JOIN users u ON t.creator_id = u.id
        WHERE ts.shared_with_id = $1
      `;

      if (search && search.trim()) {
        query += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
        values.push(`%${search}%`);
      }

      query += ` ORDER BY due_date ASC NULLS LAST`;

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching accessible tasks:', error);
      throw error;
    }
  }

  /**
   * Get all tasks visible to a user.
   */
  static async findAll(userId: string, search?: string): Promise<any[]> {
    return this.findAccessibleTasks(userId, search);
  }

  /**
   * Get all realtime recipients for a task.
   */
  static async getRealtimeRecipients(taskId: string): Promise<Array<{ auth0_id: string; access_permission: 'owner' | 'view' | 'edit' }>> {
    try {
      const result = await pool.query(
        `SELECT DISTINCT u.auth0_id, 'owner'::text as access_permission
         FROM tasks t
         INNER JOIN users u ON t.creator_id = u.id
         WHERE t.id = $1
         UNION
         SELECT DISTINCT u.auth0_id, ts.permission as access_permission
         FROM task_shares ts
         INNER JOIN users u ON ts.shared_with_id = u.id
         WHERE ts.task_id = $1`,
        [taskId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching realtime recipients:', error);
      throw error;
    }
  }

  /**
   * Share a task with another user
   */
  static async shareTask(taskId: string, sharedByUserId: string, sharedWithEmail: string, permission: string = 'view'): Promise<any> {
    try {
      const normalizedEmail = sharedWithEmail.trim().toLowerCase();

      // First verify the task belongs to the user trying to share
      const task = await this.findByIdAndUserId(taskId, sharedByUserId);
      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      // Get the user to share with
      const userResult = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [normalizedEmail]);
      if (!userResult.rows[0]) {
        const error = new Error('Share target not found');
        error.name = 'ShareTargetNotFoundError';
        throw error;
      }

      const sharedWithUserId = userResult.rows[0].id;

      // Check if already shared
      const existingShare = await pool.query(
        'SELECT * FROM task_shares WHERE task_id = $1 AND shared_with_id = $2',
        [taskId, sharedWithUserId]
      );

      if (existingShare.rows[0]) {
        // Update existing share
        const result = await pool.query(
          'UPDATE task_shares SET permission = $1, updated_at = CURRENT_TIMESTAMP WHERE task_id = $2 AND shared_with_id = $3 RETURNING *',
          [permission, taskId, sharedWithUserId]
        );
        return result.rows[0];
      } else {
        // Create new share
        const result = await pool.query(
          `INSERT INTO task_shares (task_id, shared_with_id, shared_by_id, permission)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [taskId, sharedWithUserId, sharedByUserId, permission]
        );
        return result.rows[0];
      }
    } catch (error) {
      console.error('Error sharing task:', error);
      throw error;
    }
  }

  /**
   * Unshare a task
   */
  static async unshareTask(taskId: string, sharedByUserId: string, sharedWithEmail: string): Promise<boolean> {
    try {
      // Verify the task belongs to the user trying to unshare
      const task = await this.findByIdAndUserId(taskId, sharedByUserId);
      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      // Get the user to unshare with
      const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [sharedWithEmail]);
      if (!userResult.rows[0]) {
        throw new Error('User not found');
      }

      const sharedWithUserId = userResult.rows[0].id;

      const result = await pool.query(
        'DELETE FROM task_shares WHERE task_id = $1 AND shared_with_id = $2',
        [taskId, sharedWithUserId]
      );
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error('Error unsharing task:', error);
      throw error;
    }
  }

  /**
   * Get all users a task is shared with
   */
  static async getTaskShares(taskId: string, userId: string): Promise<any[]> {
    try {
      // Verify the task belongs to the user
      const task = await this.findByIdAndUserId(taskId, userId);
      if (!task) {
        throw new Error('Task not found or unauthorized');
      }

      const result = await pool.query(
        `SELECT ts.*, u.email, u.id as user_id
         FROM task_shares ts
         INNER JOIN users u ON ts.shared_with_id = u.id
         WHERE ts.task_id = $1
         ORDER BY ts.created_at DESC`,
        [taskId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching task shares:', error);
      throw error;
    }
  }
}
