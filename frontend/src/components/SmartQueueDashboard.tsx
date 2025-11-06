import * as React from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, UserCheck, BarChart3, Zap, Brain, Settings as SettingsIcon, User, Plus, RefreshCw, LogOut } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import UserProfile from './UserProfile'
import Settings from './Settings'
import AddCustomerModal from './AddCustomerModal'
import ConversationSummaryModal from './ConversationSummaryModal'
import FeedbackFormModal from './FeedbackFormModal'
import ConversationTimer from './ConversationTimer'
import TimeNotificationModal from './TimeNotificationModal'
import { useCustomers, useAgents, useRouting, useAnalytics, useAutoRefresh } from '../hooks/useApi'
import { Customer, Agent, RoutingResult } from '../types'

const FloatingOrb = ({ color, position }: { color: string; position: [number, number, number] }) => (
  <Sphere args={[0.5, 32, 32]} position={position}>
    <MeshDistortMaterial
      color={color}
      attach="material"
      distort={0.2}
      speed={2}
      roughness={0.1}
      metalness={0.8}
    />
  </Sphere>
)

interface SmartQueueDashboardProps {
  onLogout?: () => void
}

const SmartQueueDashboard: React.FC<SmartQueueDashboardProps> = ({ onLogout }) => {
  // Get user from localStorage for now
  const user = React.useMemo(() => {
    try {
      const userData = localStorage.getItem('user-data')
      return userData ? JSON.parse(userData) : { name: 'Admin' }
    } catch {
      return { name: 'Admin' }
    }
  }, [])
  const [isLoading, setIsLoading] = React.useState(true)
  const [showUserProfile, setShowUserProfile] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const [showAddCustomer, setShowAddCustomer] = React.useState(false)
  const [showSummary, setShowSummary] = React.useState(false)
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [currentSummary, setCurrentSummary] = React.useState<any>(null)
  const [currentRoutingId, setCurrentRoutingId] = React.useState<string>('')
  const [notification, setNotification] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Conversation timer states
  const [showTimeNotification, setShowTimeNotification] = React.useState(false)
  const [timeNotificationData, setTimeNotificationData] = React.useState<{
    type: 'warning' | 'expired'
    routingId: string
    customerName: string
    agentName: string
    timeRemaining: number
  } | null>(null)

  // API hooks
  const { customers, loading: customersLoading, refetch: refetchCustomers } = useCustomers()
  const { agents, availableCount, loading: agentsLoading, refetch: refetchAgents } = useAgents()
  const { routingResults, loading: routingLoading, performAutoRouting, resetQueue, completeTask, completeAllTasks, refetch: refetchRoutingResults } = useRouting()
  const { metrics, loading: metricsLoading, refetch: refetchMetrics } = useAnalytics()

  // Auto-refresh data every 30 seconds
  useAutoRefresh(() => {
    refetchCustomers()
    refetchAgents()
    refetchMetrics()
    refetchRoutingResults()
  }, 30000)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleAutoRoute = async () => {
    try {
      console.log('🔄 Starting auto routing...')
      console.log(`📊 Current state: ${customers.length} customers, ${availableCount} available agents`)

      const response = await performAutoRouting()
      console.log('✅ Auto routing response:', response)

      if (response.results && response.results.length > 0) {
        showNotification(`Successfully routed ${response.results.length} customers!`, 'success')
        console.log(`🎯 Routed ${response.results.length} customers`)
      } else {
        showNotification(response.message || 'No customers were routed', 'info')
        console.log('ℹ️ No customers routed:', response.message)
      }

      // Refresh data after routing
      console.log('🔄 Refreshing data...')
      refetchCustomers()
      refetchAgents()
      refetchMetrics()
      refetchRoutingResults()
    } catch (error) {
      console.error('❌ Auto routing error:', error)
      showNotification('Failed to perform auto routing', 'error')
    }
  }

  const handleResetQueue = async () => {
    try {
      await resetQueue()
      showNotification('Queue reset successfully!', 'success')
      // Refresh data after reset
      refetchCustomers()
      refetchAgents()
      refetchMetrics()
      refetchRoutingResults()
    } catch (error) {
      showNotification('Failed to reset queue', 'error')
    }
  }

  const handleAddCustomer = async (customerData: any) => {
    try {
      console.log('📤 Adding customer:', customerData)
      console.log('🔍 Debug - Customer data validation:', {
        hasName: !!customerData.name,
        nameLength: customerData.name?.length,
        priority: customerData.priority,
        complexity: customerData.issue_complexity
      })

      // Validate required fields
      if (!customerData.name || !customerData.name.trim()) {
        throw new Error('Customer name is required')
      }

      if (customerData.priority < 1 || customerData.priority > 10) {
        throw new Error('Priority must be between 1 and 10')
      }

      if (customerData.issue_complexity < 1 || customerData.issue_complexity > 5) {
        throw new Error('Issue complexity must be between 1 and 5')
      }

      const response = await fetch('http://localhost:8000/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      })

      const data = await response.json()
      console.log('📥 Response:', data)

      if (response.ok) {
        showNotification(`Customer ${data.customer.name} added successfully!`, 'success')
        // Refresh customers list immediately
        setTimeout(() => {
          refetchCustomers()
        }, 500)
      } else {
        console.error('❌ Error response:', data)
        const errorMessage = data.error || data.detail || 'Failed to add customer'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('❌ Error adding customer:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add customer'
      showNotification(errorMessage, 'error')
      throw error
    }
  }

  // Conversation timer handlers
  const handleTimeWarning = (routingId: string, timeRemaining: number) => {
    const routingResult = routingResults.find(r => r.id === routingId)
    if (routingResult) {
      setTimeNotificationData({
        type: 'warning',
        routingId,
        customerName: routingResult.customer_name || 'Customer',
        agentName: routingResult.agent_name || 'Agent',
        timeRemaining
      })
      setShowTimeNotification(true)

      // Play notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
        audio.play().catch(() => { }) // Ignore errors if audio fails
      } catch (e) {
        // Ignore audio errors
      }
    }
  }

  const handleTimeExpired = (routingId: string) => {
    const routingResult = routingResults.find(r => r.id === routingId)
    if (routingResult) {
      setTimeNotificationData({
        type: 'expired',
        routingId,
        customerName: routingResult.customer_name || 'Customer',
        agentName: routingResult.agent_name || 'Agent',
        timeRemaining: 0
      })
      setShowTimeNotification(true)

      // Play urgent notification sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
        audio.play().catch(() => { })
      } catch (e) {
        // Ignore audio errors
      }
    }
  }

  const handleEndConversation = async (routingId: string) => {
    try {
      const response = await completeTask(routingId)

      if (response.routing_result?.conversation_summary) {
        setCurrentSummary(response.routing_result.conversation_summary)
        setCurrentRoutingId(routingId)
        setShowSummary(true)
      }

      showNotification('Conversation ended successfully!', 'success')
      setShowTimeNotification(false)
      refetchAgents()
      refetchCustomers()
      refetchMetrics()
    } catch (error) {
      showNotification('Failed to end conversation', 'error')
    }
  }

  const handleSendSMS = async () => {
    if (!timeNotificationData) return

    try {
      const response = await fetch(`http://localhost:8000/conversation/${timeNotificationData.routingId}/send-sms-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: timeNotificationData.type
        })
      })

      const data = await response.json()

      if (response.ok) {
        showNotification(`SMS alert sent to ${timeNotificationData.customerName}`, 'success')
      } else {
        throw new Error(data.error || 'Failed to send SMS')
      }
    } catch (error) {
      console.error('SMS send error:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-gradient flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 animate-pulse">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Initializing AI Engine...</h2>
          <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-20">
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <FloatingOrb color="#ff7849" position={[-4, 2, -2]} />
          <FloatingOrb color="#ff6b9d" position={[4, -2, -3]} />
          <FloatingOrb color="#546de5" position={[0, 3, -4]} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-warm-gradient rounded-2xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  AI Smart Queue Routing
                </h1>
                <p className="text-sm text-white/70">
                  Intelligent customer-agent matching powered by ML
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <div className={`h-2 w-2 rounded-full animate-pulse ${metrics?.model_info.model_loaded ? 'bg-rs-high' : 'bg-rs-medium'
                  }`}></div>
                <span className="text-sm text-white">
                  {metrics?.model_info.model_loaded ? 'AI Engine Active' : 'Fallback Mode'}
                </span>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 bg-white/10 backdrop-blur-md rounded-xl text-white hover:bg-white/20 transition-all duration-300"
                >
                  <SettingsIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={() => setShowUserProfile(true)}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 text-white hover:bg-white/20 transition-all duration-300"
                >
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.name || 'Admin'}
                  </span>
                </button>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 bg-red-500/20 backdrop-blur-md rounded-xl text-red-300 hover:bg-red-500/30 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Dashboard */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAutoRoute}
            disabled={routingLoading || customers.length === 0}
            className="bg-warm-gradient text-white font-semibold px-6 py-3 rounded-2xl flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {routingLoading ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
            <span>{routingLoading ? 'Routing...' : 'Auto Route'}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddCustomer(true)}
            className="bg-white/10 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-2xl flex items-center space-x-2 border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            <span>Add Customer</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              try {
                const response = await completeAllTasks()
                showNotification(`Completed ${response.completed_count} tasks!`, 'success')
                refetchAgents()
                refetchCustomers()
                refetchMetrics()
              } catch (error) {
                showNotification('Failed to complete tasks', 'error')
              }
            }}
            disabled={routingLoading || routingResults.filter(r => r.status === 'active').length === 0}
            className="bg-green-500/20 backdrop-blur-md text-green-300 font-semibold px-6 py-3 rounded-2xl border border-green-500/30 hover:bg-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete All Tasks ({routingResults.filter(r => r.status === 'active').length})
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResetQueue}
            disabled={routingLoading}
            className="bg-red-500/20 backdrop-blur-md text-red-300 font-semibold px-6 py-3 rounded-2xl border border-red-500/30 hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset Queue
          </motion.button>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Queue Panel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Users className="h-6 w-6 text-warm-orange" />
                  <span>Customer Queue</span>
                </h2>
                <span className="bg-warm-blue/20 text-warm-blue px-3 py-1 rounded-full text-sm font-semibold">
                  {customers.length} waiting
                </span>
              </div>

              <div className="space-y-4">
                {customersLoading ? (
                  <div className="text-center py-8 text-white/60">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Loading customers...</p>
                  </div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No customers in queue</p>
                  </div>
                ) : (
                  customers.map((customer, index) => (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-white">{customer.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.sentiment === 'positive' ? 'bg-sentiment-positive/20 text-sentiment-positive' :
                          customer.sentiment === 'negative' ? 'bg-sentiment-negative/20 text-sentiment-negative' :
                            'bg-sentiment-neutral/20 text-sentiment-neutral'
                          }`}>
                          {customer.sentiment.charAt(0).toUpperCase() + customer.sentiment.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-white/70 space-y-1">
                        <p className="flex items-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${customer.issue_type === 'technical_support' ? 'bg-warm-orange' :
                            customer.issue_type === 'billing' ? 'bg-warm-teal' :
                              customer.issue_type === 'sales' ? 'bg-warm-pink' :
                                'bg-warm-purple'
                            }`}></span>
                          <span>{customer.issue_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        </p>
                        <p>
                          Tier: {customer.tier.charAt(0).toUpperCase() + customer.tier.slice(1)} •
                          {customer.channel.charAt(0).toUpperCase() + customer.channel.slice(1)} •
                          Priority: {customer.priority}
                        </p>
                        <p className="text-warm-orange">
                          Wait time: {Math.floor(customer.wait_time / 60)}m {customer.wait_time % 60}s
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Agent Pool Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <UserCheck className="h-6 w-6 text-warm-teal" />
                  <span>Agent Pool</span>
                </h2>
                <span className="bg-status-available/20 text-status-available px-3 py-1 rounded-full text-sm font-semibold">
                  {availableCount} available
                </span>
              </div>

              <div className="space-y-4">
                {agentsLoading ? (
                  <div className="text-center py-8 text-white/60">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Loading agents...</p>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8 text-white/60">
                    <UserCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No agents available</p>
                  </div>
                ) : (
                  agents.map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-white">{agent.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.status === 'available' ? 'bg-status-available/20 text-status-available' :
                          agent.status === 'busy' ? 'bg-status-busy/20 text-status-busy' :
                            'bg-status-offline/20 text-status-offline'
                          }`}>
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </span>
                      </div>
                      <div className="text-sm text-white/70 space-y-1">
                        <p>Specialties: {agent.specialty.join(', ').replace(/_/g, ' ')}</p>
                        <p>Experience: {agent.experience} years • Success: {Math.round(agent.past_success_rate * 100)}%</p>
                        <div className="flex items-center space-x-2">
                          <span>Workload: {agent.current_workload}/{agent.max_concurrent}</span>
                          <div className="flex-1 bg-white/10 rounded-full h-2">
                            <div
                              className="bg-warm-teal h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(agent.current_workload / agent.max_concurrent) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          {/* Routing Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-warm-pink" />
                  <span>AI Routing</span>
                </h2>
                <span className="bg-gray-500/20 text-gray-300 px-3 py-1 rounded-full text-sm font-semibold">
                  Ready
                </span>
              </div>

              <div className="space-y-4">
                {routingResults.length === 0 ? (
                  <div className="text-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 mx-auto mb-4 bg-warm-gradient rounded-full flex items-center justify-center"
                    >
                      <Brain className="h-8 w-8 text-white" />
                    </motion.div>
                    <p className="text-white/80 mb-2">
                      {metrics?.model_info.model_loaded ? 'AI Engine Ready' : 'Fallback Mode Active'}
                    </p>
                    <p className="text-sm text-white/60">Click "Auto Route" to see intelligent matches</p>
                  </div>
                ) : (
                  routingResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="text-white font-medium text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-warm-orange">{result.customer_name || 'Customer'}</span>
                            <span className="text-white/50">→</span>
                            <span className="text-warm-teal">{result.agent_name || 'Agent'}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.routing_score >= 0.8 ? 'bg-rs-high/20 text-rs-high' :
                          result.routing_score >= 0.6 ? 'bg-rs-medium/20 text-rs-medium' :
                            'bg-rs-low/20 text-rs-low'
                          }`}>
                          {Math.round(result.routing_score * 100)}%
                        </span>
                      </div>
                      <div className="text-sm text-white/70 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">Score: {result.routing_score.toFixed(3)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${result.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            result.status === 'active' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-gray-500/20 text-gray-300'
                            }`}>
                            {result.status}
                          </span>
                        </div>
                        <p className="text-xs text-white/50">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </p>
                        {result.reasoning.length > 0 && (
                          <div className="mt-2 text-xs text-white/60 line-clamp-2">
                            {result.reasoning[0]}
                          </div>
                        )}
                      </div>

                      {/* Complete Task Button */}
                      {result.status === 'active' && (
                        <button
                          onClick={async () => {
                            try {
                              const response = await completeTask(result.id)

                              if (response.routing_result?.conversation_summary) {
                                setCurrentSummary(response.routing_result.conversation_summary)
                                setCurrentRoutingId(result.id)
                                setShowSummary(true)
                              }

                              showNotification('Task completed! Agent is now available.', 'success')
                              refetchAgents()
                              refetchCustomers()
                              refetchMetrics()
                            } catch (error) {
                              showNotification('Failed to complete task', 'error')
                            }
                          }}
                          className="mt-3 w-full bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-medium py-2 rounded-lg transition-all duration-300 border border-green-500/30"
                        >
                          ✓ Complete Task
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analytics Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-warm-purple" />
              <span>Performance Analytics</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-warm-teal mb-2">
                  {metrics ? Math.round(metrics.routing_stats.average_score * 100) : 75}%
                </div>
                <div className="text-white/70 text-sm">Routing Accuracy</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-warm-orange mb-2">&lt;200ms</div>
                <div className="text-white/70 text-sm">Avg Response Time</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-warm-pink mb-2">
                  {metrics ? metrics.queue_metrics.customers_waiting : 0}
                </div>
                <div className="text-white/70 text-sm">Customers Waiting</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-warm-purple mb-2">
                  {metrics ? metrics.routing_stats.total_routings : 0}
                </div>
                <div className="text-white/70 text-sm">Total Routings</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={showAddCustomer}
        onClose={() => setShowAddCustomer(false)}
        onSubmit={handleAddCustomer}
      />

      {/* Conversation Summary Modal */}
      <ConversationSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        conversation={currentSummary}
        agent={currentSummary ? { name: currentSummary.agent_name } : null}
      />

      {/* Feedback Form Modal */}
      <FeedbackFormModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        conversationId={currentRoutingId}
        agent={currentSummary ? { name: currentSummary.agent_name } : null}
      />

      {/* Time Notification Modal */}
      {timeNotificationData && (
        <TimeNotificationModal
          isOpen={showTimeNotification}
          onClose={() => setShowTimeNotification(false)}
          type={timeNotificationData.type}
          timeRemaining={timeNotificationData.timeRemaining}
          customerName={timeNotificationData.customerName}
          agentName={timeNotificationData.agentName}
          onEndConversation={() => handleEndConversation(timeNotificationData.routingId)}
          onSendSMS={handleSendSMS}
        />
      )}

      {/* Notification */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-2xl backdrop-blur-md border shadow-lg ${notification.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-300' :
            notification.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-300' :
              'bg-blue-500/20 border-blue-500/30 text-blue-300'
            }`}
        >
          {notification.message}
        </motion.div>
      )}
    </div>
  )
}

export default SmartQueueDashboard