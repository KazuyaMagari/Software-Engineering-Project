import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { User } from '../models/User';

export class TaskController {
  /**
   * Get all tasks for authenticated user with optional search
   */
  static async getTasks(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { search } = req.query;
      const searchTerm = typeof search === 'string' ? search : undefined;

      // Get user by Firebase UID
      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const tasks = await Task.findByUserId(user.id, searchTerm);

      return res.json({
        success: true,
        userId: user.id,
        email: user.email,
        count: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error('Error in getTasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  /**
   * Get all tasks for a user by email (deprecated - use getTasks)
   */
  static async getTasksByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email, search } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email parameter is required' });
      }

      const searchTerm = typeof search === 'string' ? search : undefined;
      const tasks = await Task.findByUserEmail(email, searchTerm);

      return res.json({
        success: true,
        email,
        count: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error('Error in getTasksByEmail:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  /**
   * Create a new task for authenticated user
   */
  static async createTask(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, description, priority, status, due_date } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      // Get or create user
      const user = await User.getOrCreateByFirebaseUid(req.user.uid, req.user.email);

      // Format due_date
      let formattedDueDate: string | undefined = undefined;
      if (due_date && due_date.trim()) {
        let dateObj: Date | null = null;

        if (/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
          dateObj = new Date(due_date + 'T00:00:00Z');
        } else if (due_date) {
          dateObj = new Date(due_date);
        }

        if (dateObj && !isNaN(dateObj.getTime())) {
          formattedDueDate = dateObj.toISOString().split('T')[0];
        }
      }

      // Create task
      const task = await Task.create(
        user.id,
        title,
        description,
        priority,
        status,
        formattedDueDate
      );

      return res.json({
        success: true,
        message: 'Task created',
        task: {
          ...task,
          owner_id: task.creator_id,
          creator_email: user.email,
          access_permission: 'owner',
        },
      });
    } catch (error) {
      console.error('Error in createTask:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }
  }

  /**
   * Update task status for authenticated user
   */
  static async updateTaskStatus(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { taskId, status } = req.body;

      if (!taskId || !status) {
        return res.status(400).json({ error: 'Task ID and status are required' });
      }

      // Get user
      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const task = await Task.updateStatus(taskId, status, user.id);

      return res.json({
        success: true,
        message: 'Task updated',
        task,
      });
    } catch (error: any) {
      console.error('Error in updateTaskStatus:', error);
      if (error.message === 'Task not found or unauthorized') {
        return res.status(403).json({ error: 'Task not found or unauthorized' });
      }
      return res.status(500).json({ error: 'Failed to update task' });
    }
  }

  /**
   * Update a task (all fields) for authenticated user
   */
  static async updateTask(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { taskId, title, description, priority, status, due_date } = req.body;

      if (!taskId || !title) {
        return res.status(400).json({ error: 'Task ID and title are required' });
      }

      // Get user
      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const task = await Task.update(taskId, user.id, {
        title,
        description,
        priority,
        status,
        due_date,
      });

      return res.json({
        success: true,
        message: 'Task updated',
        task,
      });
    } catch (error: any) {
      console.error('Error in updateTask:', error);
      if (error.message === 'Task not found or unauthorized') {
        return res.status(403).json({ error: 'Task not found or unauthorized' });
      }
      return res.status(500).json({ error: 'Failed to update task' });
    }
  }

  /**
   * Delete a task for authenticated user
   */
  static async deleteTask(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { taskId } = req.body;

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      // Get user
      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const hasAccess = await Task.hasAccess(taskId, user.id);
      if (!hasAccess) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const isOwner = await Task.isOwner(taskId, user.id);
      if (!isOwner) {
        return res.status(403).json({
          error: 'View-only tasks cannot be deleted',
          details: 'Only the task owner can delete this task',
        });
      }

      const deleted = await Task.delete(taskId, user.id);

      if (!deleted) {
        return res.status(500).json({ error: 'Failed to delete task' });
      }

      return res.json({
        success: true,
        message: 'Task deleted',
      });
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  /**
   * Get all accessible tasks (owned + shared) for authenticated user
   */
  static async getAccessibleTasks(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { search } = req.query;
      const searchTerm = typeof search === 'string' ? search : undefined;

      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const tasks = await Task.findAll(user.id, searchTerm);

      return res.json({
        success: true,
        count: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error('Error in getAccessibleTasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  /**
   * Share a task with another user
   */
  static async shareTask(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { taskId, email, permission } = req.body;

      if (!taskId || !email) {
        return res.status(400).json({ error: 'Task ID and email are required' });
      }

      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const share = await Task.shareTask(taskId, user.id, email, permission || 'view');

      return res.json({
        success: true,
        message: 'Task shared',
        share,
      });
    } catch (error: any) {
      console.error('Error in shareTask:', error);
      if (error.message === 'Task not found or unauthorized') {
        return res.status(403).json({ error: 'Task not found or unauthorized' });
      }
      if (error.name === 'ShareTargetNotFoundError') {
        return res.status(404).json({
          error: 'Share target not found',
          details: 'The recipient needs to sign in to this app at least once before a task can be shared with that email.',
        });
      }
      return res.status(500).json({ error: 'Failed to share task' });
    }
  }

  /**
   * Unshare a task
   */
  static async unshareTask(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { taskId, email } = req.body;

      if (!taskId || !email) {
        return res.status(400).json({ error: 'Task ID and email are required' });
      }

      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const unshared = await Task.unshareTask(taskId, user.id, email);

      if (!unshared) {
        return res.status(404).json({ error: 'Share not found' });
      }

      return res.json({
        success: true,
        message: 'Task unshared',
      });
    } catch (error: any) {
      console.error('Error in unshareTask:', error);
      if (error.message === 'Task not found or unauthorized') {
        return res.status(403).json({ error: 'Task not found or unauthorized' });
      }
      return res.status(500).json({ error: 'Failed to unshare task' });
    }
  }

  /**
   * Get all users a task is shared with
   */
  static async getTaskShares(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { taskId } = req.query;

      if (!taskId || typeof taskId !== 'string') {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      const user = await User.findByFirebaseUid(req.user.uid);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const shares = await Task.getTaskShares(taskId, user.id);

      return res.json({
        success: true,
        shares,
      });
    } catch (error: any) {
      console.error('Error in getTaskShares:', error);
      if (error.message === 'Task not found or unauthorized') {
        return res.status(403).json({ error: 'Task not found or unauthorized' });
      }
      return res.status(500).json({ error: 'Failed to fetch shares' });
    }
  }
}
