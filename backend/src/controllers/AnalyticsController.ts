import { Request, Response } from 'express'
import { Analytics } from '../models/Analytics'

export class AnalyticsController {
  static async getTaskStats(req: Request, res: Response) {
    try {
      const { email } = req.query
      if (!email) return res.status(400).json({ error: 'Email required' })
      const stats = await Analytics.getTaskStats(email as string)
      res.json(stats)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch task stats' })
    }
  }

  static async getStatusBreakdown(req: Request, res: Response) {
    try {
      const { email } = req.query
      if (!email) return res.status(400).json({ error: 'Email required' })
      const data = await Analytics.getStatusBreakdown(email as string)
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch status breakdown' })
    }
  }

  static async getPriorityBreakdown(req: Request, res: Response) {
    try {
      const { email } = req.query
      if (!email) return res.status(400).json({ error: 'Email required' })
      const data = await Analytics.getPriorityBreakdown(email as string)
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch priority breakdown' })
    }
  }

  static async getCompletionTrends(req: Request, res: Response) {
    try {
      const { email, days } = req.query
      if (!email) return res.status(400).json({ error: 'Email required' })
      const data = await Analytics.getCompletionTrends(email as string, Number(days) || 30)
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch completion trends' })
    }
  }

  static async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const { email } = req.query
      if (!email) return res.status(400).json({ error: 'Email required' })
      const metrics = await Analytics.getPerformanceMetrics(email as string)
      res.json(metrics)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch performance metrics' })
    }
  }

  static async getTeamPerformance(req: Request, res: Response) {
    try {
      const data = await Analytics.getTeamPerformance()
      res.json(data)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch team performance' })
    }
  }
}
