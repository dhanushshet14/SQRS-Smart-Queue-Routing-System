import { useState, useEffect, useCallback } from 'react'
import { Customer, Agent, RoutingResult } from '../types'
import { customerApi, agentApi, routingApi, analyticsApi, PerformanceMetrics } from '../services/api'

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await customerApi.getAll()
      setCustomers(data.customers)
      setError(null)
    } catch (err) {
      setError('Failed to fetch customers')
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return { customers, loading, error, refetch: fetchCustomers }
}

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availableCount, setAvailableCount] = useState(0)

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await agentApi.getAll()
      setAgents(data.agents)
      setAvailableCount(data.available_count)
      setError(null)
    } catch (err) {
      setError('Failed to fetch agents')
      console.error('Error fetching agents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  return { agents, availableCount, loading, error, refetch: fetchAgents }
}

export const useRouting = () => {
  const [routingResults, setRoutingResults] = useState<RoutingResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRoutingResults = useCallback(async () => {
    try {
      const data = await routingApi.getResults()
      setRoutingResults(data.results)
      setError(null)
    } catch (err) {
      setError('Failed to fetch routing results')
      console.error('Error fetching routing results:', err)
    }
  }, [])

  const performAutoRouting = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await routingApi.autoRoute()
      setRoutingResults(response.results)
      return response
    } catch (err) {
      setError('Failed to perform auto routing')
      console.error('Error in auto routing:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetQueue = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await routingApi.resetQueue()
      setRoutingResults([])
    } catch (err) {
      setError('Failed to reset queue')
      console.error('Error resetting queue:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const completeTask = useCallback(async (routingId: string) => {
    try {
      setError(null)
      const response = await routingApi.completeTask(routingId)
      // Refresh routing results after completion
      await fetchRoutingResults()
      return response
    } catch (err) {
      setError('Failed to complete task')
      console.error('Error completing task:', err)
      throw err
    }
  }, [fetchRoutingResults])

  const completeAllTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await routingApi.completeAllTasks()
      // Refresh routing results after completion
      await fetchRoutingResults()
      return response
    } catch (err) {
      setError('Failed to complete all tasks')
      console.error('Error completing all tasks:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchRoutingResults])

  // Fetch routing results on mount
  useEffect(() => {
    fetchRoutingResults()
  }, [fetchRoutingResults])

  return {
    routingResults,
    loading,
    error,
    performAutoRouting,
    resetQueue,
    completeTask,
    completeAllTasks,
    refetch: fetchRoutingResults,
  }
}

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      const data = await analyticsApi.getPerformanceMetrics()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return { metrics, loading, error, refetch: fetchMetrics }
}

export const useAutoRefresh = (callback: () => void, interval: number = 30000) => {
  useEffect(() => {
    const timer = setInterval(callback, interval)
    return () => clearInterval(timer)
  }, [callback, interval])
}