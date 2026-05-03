import { Request, Response } from 'express'
import { Analytics } from '../models/Analytics'
import { User } from '../models/User'

export class AnalyticsController {
  static async getTaskStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const user = await User.findByFirebaseUid(req.user.uid)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const stats = await Analytics.getTaskStats(user.id)
      res.json(stats)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch task stats' })
    }
  }

  static async getStatusBreakdown(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const user = await User.findByFirebaseUid(req.user.uid)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const data = await Analytics.getStatusBreakdown(user.id)
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch status breakdown' })
    }
  }

  static async getPriorityBreakdown(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const user = await User.findByFirebaseUid(req.user.uid)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const data = await Analytics.getPriorityBreakdown(user.id)
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch priority breakdown' })
    }
  }

  static async getCompletionTrends(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const user = await User.findByFirebaseUid(req.user.uid)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const { days } = req.query
      const data = await Analytics.getCompletionTrends(user.id, Number(days) || 30)
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch completion trends' })
    }
  }

  static async getPerformanceMetrics(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const user = await User.findByFirebaseUid(req.user.uid)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const metrics = await Analytics.getPerformanceMetrics(user.id)
      res.json(metrics)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch performance metrics' })
    }
  }

  static async getTeamPerformance(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const data = await Analytics.getTeamPerformance()
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch team performance' })
    }
  }
}
