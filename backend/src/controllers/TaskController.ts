import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { User } from '../models/User';

export class TaskController {
  /**
   * Get all tasks for a user
   */
  static async getTasksByEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email parameter is required' });
      }

      const tasks = await Task.findByUserEmail(email);

      return res.json({
        success: true,
        email,
        taskCount: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error('Error in getTasksByEmail:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  /**
   * Create a new task
   */
  static async createTask(req: Request, res: Response): Promise<Response> {
    try {
      const { email, title, description, priority, status, due_date } = req.body;

      if (!email || !title) {
        return res.status(400).json({ error: 'Email and title are required' });
      }

      // Get user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

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
        task,
      });
    } catch (error) {
      console.error('Error in createTask:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId, status } = req.body;

      if (!taskId || !status) {
        return res.status(400).json({ error: 'Task ID and status are required' });
      }

      const task = await Task.updateStatus(taskId, status);

      return res.json({
        success: true,
        message: 'Task updated',
        task,
      });
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  }

  /**
   * Update a task (all fields)
   */
  static async updateTask(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId, title, description, priority, status, due_date } = req.body;

      if (!taskId || !title) {
        return res.status(400).json({ error: 'Task ID and title are required' });
      }

      const task = await Task.update(taskId, {
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
    } catch (error) {
      console.error('Error in updateTask:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  }

  /**
   * Delete a task
   */
  static async deleteTask(req: Request, res: Response): Promise<Response> {
    try {
      const { taskId } = req.body;

      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      const deleted = await Task.delete(taskId);

      if (!deleted) {
        return res.status(404).json({ error: 'Task not found' });
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
}
