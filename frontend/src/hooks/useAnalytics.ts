import { useState, useRef } from 'react'
import { analyticsAPI } from '../services/api'

export interface TaskStats {
  total: number
  completed: number
  in_progress: number
  open: number
  review: number
  overdue: number
  completion_rate: number
}

export interface StatusBreakdown {
  status: string
  count: number
  percentage: number
}

export interface PriorityBreakdown {
  priority: string
  count: number
  percentage: number
}

export interface CompletionTrend {
  date: string
  completed: number
  cumulative: number
}

export interface PerformanceMetrics {
  average_completion_time: number
  high_priority_completed: number
  high_priority_pending: number
  on_time_completion: number
  late_completion: number
}

export interface TeamMember {
  email: string
  total_tasks: number
  completed_tasks: number
  completion_rate: number
  average_completion_time: number
}

export function useAnalytics() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRequests = useRef(0)

  const setLoadingState = (active: boolean) => {
    if (active) {
      activeRequests.current++
      setLoading(true)
    } else {
      activeRequests.current--
      if (activeRequests.current <= 0) {
        activeRequests.current = 0
        setLoading(false)
      }
    }
  }

  const getTaskStats = async (): Promise<TaskStats | null> => {
    try {
      setLoadingState(true)
      const data = await analyticsAPI.getTaskStats()
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  const getStatusBreakdown = async (): Promise<StatusBreakdown[] | null> => {
    try {
      setLoadingState(true)
      const data = await analyticsAPI.getStatusBreakdown()
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  const getPriorityBreakdown = async (): Promise<PriorityBreakdown[] | null> => {
    try {
      setLoadingState(true)
      const data = await analyticsAPI.getPriorityBreakdown()
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  const getCompletionTrends = async (days: number = 30): Promise<CompletionTrend[] | null> => {
    try {
      setLoadingState(true)
      const data = await analyticsAPI.getCompletionTrends(days)
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  const getPerformanceMetrics = async (): Promise<PerformanceMetrics | null> => {
    try {
      setLoadingState(true)
      const data = await analyticsAPI.getPerformanceMetrics()
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  const getTeamPerformance = async (): Promise<TeamMember[] | null> => {
    try {
      setLoadingState(true)
      const data = await analyticsAPI.getTeamPerformance()
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  return {
    loading,
    error,
    getTaskStats,
    getStatusBreakdown,
    getPriorityBreakdown,
    getCompletionTrends,
    getPerformanceMetrics,
    getTeamPerformance
  }
}
