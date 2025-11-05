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

  return {
    routingResults,
    loading,
    error,
    performAutoRouting,
    resetQueue,
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