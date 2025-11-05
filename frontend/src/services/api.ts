import axios from 'axios'
import { Customer, Agent, RoutingResult, CustomerCreate, ManualAssignment } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface RoutingResponse {
  results: RoutingResult[]
  statistics: {
    total_routings: number
    average_score: number
    high_confidence_matches: number
    medium_confidence_matches: number
    low_confidence_matches: number
  }
  message: string
}

export interface PerformanceMetrics {
  routing_stats: {
    total_routings: number
    average_score: number
    high_confidence_matches: number
    medium_confidence_matches: number
    low_confidence_matches: number
  }
  queue_metrics: {
    customers_waiting: number
    agents_available: number
    agents_busy: number
    total_agents: number
  }
  model_info: {
    model_loaded: boolean
    model_type: string
    feature_count: number
    features: string[]
  }
}

// Customer API
export const customerApi = {
  getAll: async (): Promise<{ customers: Customer[]; count: number }> => {
    const response = await api.get('/customers')
    return response.data
  },

  create: async (customer: CustomerCreate): Promise<{ customer: Customer; message: string }> => {
    const response = await api.post('/customers', customer)
    return response.data
  },

  delete: async (customerId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/customers/${customerId}`)
    return response.data
  },
}

// Agent API
export const agentApi = {
  getAll: async (): Promise<{ agents: Agent[]; total_count: number; available_count: number }> => {
    const response = await api.get('/agents')
    return response.data
  },

  updateStatus: async (agentId: string, status: string): Promise<{ agent: Agent; message: string }> => {
    const response = await api.put(`/agents/${agentId}/status`, { status })
    return response.data
  },
}

// Routing API
export const routingApi = {
  autoRoute: async (): Promise<RoutingResponse> => {
    const response = await api.post('/route')
    return response.data
  },

  manualRoute: async (assignment: ManualAssignment): Promise<{ result: RoutingResult; message: string }> => {
    const response = await api.post('/route/manual', assignment)
    return response.data
  },

  resetQueue: async (): Promise<{ message: string }> => {
    const response = await api.post('/route/reset')
    return response.data
  },
}

// Analytics API
export const analyticsApi = {
  getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
    const response = await api.get('/analytics/performance')
    return response.data
  },
}

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/health')
    return response.data
  },
}

export default api

// AI Model Management API
export const aiModelApi = {
  getInfo: async (): Promise<{
    model_info: any
    model_stats: any
    status: string
  }> => {
    const response = await api.get('/ai/model/info')
    return response.data
  },

  retrain: async (): Promise<{
    message: string
    new_stats: any
    improvement: any
  }> => {
    const response = await api.post('/ai/model/retrain')
    return response.data
  },

  getPerformance: async (): Promise<{
    current_performance: any
    feature_importance: any
    training_history: any[]
  }> => {
    const response = await api.get('/ai/model/performance')
    return response.data
  },

  updateSettings: async (settings: any): Promise<{
    message: string
    updated_settings: any
    restart_required: boolean
  }> => {
    const response = await api.post('/ai/settings/update', settings)
    return response.data
  },
}

// Dynamic Data Generation API
export const dataGenerationApi = {
  generateCustomers: async (): Promise<{
    message: string
    customers: Customer[]
  }> => {
    const response = await api.post('/data/generate/customers')
    return response.data
  },

  generateAgents: async (): Promise<{
    message: string
    agents: Agent[]
  }> => {
    const response = await api.post('/data/generate/agents')
    return response.data
  },

  updateAgentWorkload: async (agentId: string, workload: number): Promise<{
    message: string
    agent: Agent
  }> => {
    const response = await api.post(`/agents/${agentId}/workload`, { workload })
    return response.data
  },
}