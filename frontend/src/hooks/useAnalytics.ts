import { useState, useRef } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

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

  const getTaskStats = async (email: string): Promise<TaskStats | null> => {
    try {
      setLoadingState(true)
      const res = await fetch(`${API_BASE_URL}/analytics/stats?email=${email}`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  const getStatusBreakdown = async (email: string): Promise<StatusBreakdown[] | null> => {
    try {
      setLoadingState(true)
      const res = await fetch(`${API_BASE_URL}/analytics/status-breakdown?email=${email}`)
      if (!res.ok) throw new Error('Failed to fetch breakdown')
      const data = await res.json()
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  const getPriorityBreakdown = async (email: string): Promise<PriorityBreakdown[] | null> => {
    try {
      setLoadingState(true)
      const res = await fetch(`${API_BASE_URL}/analytics/priority-breakdown?email=${email}`)
      if (!res.ok) throw new Error('Failed to fetch breakdown')
      const data = await res.json()
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  const getCompletionTrends = async (email: string, days: number = 30): Promise<CompletionTrend[] | null> => {
    try {
      setLoadingState(true)
      const res = await fetch(`${API_BASE_URL}/analytics/completion-trends?email=${email}&days=${days}`)
      if (!res.ok) throw new Error('Failed to fetch trends')
      const data = await res.json()
      setError(null)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setLoadingState(false)
    }
  }

  const getPerformanceMetrics = async (email: string): Promise<PerformanceMetrics | null> => {
    try {
      setLoadingState(true)
      const res = await fetch(`${API_BASE_URL}/analytics/performance-metrics?email=${email}`)
      if (!res.ok) throw new Error('Failed to fetch metrics')
      const data = await res.json()
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
      const res = await fetch(`${API_BASE_URL}/analytics/team-performance`)
      if (!res.ok) throw new Error('Failed to fetch team data')
      const data = await res.json()
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
