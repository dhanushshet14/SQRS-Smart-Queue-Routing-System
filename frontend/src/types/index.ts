/**
 * TypeScript interfaces matching backend Pydantic models
 */

export interface Customer {
  id: string
  name: string
  sentiment: 'positive' | 'neutral' | 'negative'
  tier: 'premium' | 'standard' | 'basic'
  issue_type: string
  issue_complexity: number
  channel: 'chat' | 'voice' | 'phone' | 'email'
  wait_time: number
  priority: number
  created_at: string
  context: Record<string, any>
}

export interface CustomerCreate {
  name: string
  sentiment: 'positive' | 'neutral' | 'negative'
  tier: 'premium' | 'standard' | 'basic'
  issue_type: string
  issue_complexity: number
  channel: 'chat' | 'voice' | 'phone' | 'email'
  priority?: number
  context?: Record<string, any>
}

export interface Agent {
  id: string
  name: string
  specialty: string[]
  experience: number
  avg_handling_time: number
  past_success_rate: number
  current_workload: number
  max_concurrent: number
  status: 'available' | 'busy' | 'offline'
  skills: Record<string, number>
  last_updated: string
}

export interface RoutingResult {
  id: string
  customer_id: string
  agent_id: string
  customer_name?: string
  agent_name?: string
  routing_score: number
  timestamp: string
  reasoning: string[]
  status: 'pending' | 'active' | 'completed'
  feedback_score?: number
  actual_handling_time?: number
  success_outcome?: boolean
}

export interface ManualAssignment {
  customer_id: string
  agent_id: string
  reasoning?: string
}

export interface PerformanceMetrics {
  total_routings: number
  average_routing_score: number
  success_rate: number
  avg_handling_time: number
  customer_satisfaction: number
  agent_utilization: number
  start_date: string
  end_date: string
}

export interface AnalyticsData {
  timestamp: string
  average_rs: number
  total_routings: number
  success_rate: number
}

export type SystemStatus = 'connected' | 'offline' | 'error'

export interface DashboardProps {
  customers: Customer[]
  agents: Agent[]
  routingResults: RoutingResult[]
  systemStatus: SystemStatus
}