import * as React from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Users,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  LogOut,
  Star,
  Phone,
  Mail,
  MessageSquare,
  Settings,
  History,
  BarChart3,
  FileText,
  Calendar,
  Shield,
  Download,
  Eye,
  MapPin,
  Award,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { Agent, Customer } from '../types'
import ConversationSummaryModal from './ConversationSummaryModal'
import FeedbackFormModal from './FeedbackFormModal'
import CustomerProfile from './CustomerProfile'

interface CustomerDashboardProps {
  user: any
  onLogout: () => void
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onLogout }) => {
  const { theme } = useTheme()
  const [agents, setAgents] = React.useState<Agent[]>([])
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [querySubmitted, setQuerySubmitted] = React.useState(false)
  const [queuePosition, setQueuePosition] = React.useState(0)
  const [estimatedWait, setEstimatedWait] = React.useState(0)
  const [showQueryForm, setShowQueryForm] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('dashboard')
  const [showProfile, setShowProfile] = React.useState(false)
  const [showConversationSummary, setShowConversationSummary] = React.useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = React.useState(false)
  const [conversationCompleted, setConversationCompleted] = React.useState(false)
  const [assignedAgent, setAssignedAgent] = React.useState<Agent | null>(null)
  const [conversationHistory, setConversationHistory] = React.useState<any[]>([])
  const [customerStats, setCustomerStats] = React.useState({
    totalQueries: 0,
    resolvedQueries: 0,
    averageRating: 0,
    totalWaitTime: 0
  })
  const [showDownloadMenu, setShowDownloadMenu] = React.useState<string | null>(null)

  const [queryData, setQueryData] = React.useState({
    sentiment: 'neutral',
    tier: 'standard',
    issue_type: 'technical_support',
    issue_description: '',
    channel: 'phone',
    priority: 5,
    issue_complexity: 3
  })

  // Fetch data on component mount
  React.useEffect(() => {
    fetchAgents()
    fetchCustomers()
    fetchCustomerStats()
    fetchConversationHistory()
  }, [])

  // Close download menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDownloadMenu) {
        setShowDownloadMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDownloadMenu])

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:8000/agents')
      const data = await response.json()
      setAgents(data || [])
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:8000/customers')
      const data = await response.json()
      setCustomers(data || [])

      // Find current user's position in queue
      const userIndex = data.findIndex((customer: Customer) => customer.name === user.name)
      if (userIndex !== -1) {
        setQueuePosition(userIndex + 1)
        setEstimatedWait(Math.max(5, (userIndex + 1) * 3)) // 3 minutes per person ahead
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchCustomerStats = async () => {
    try {
      // Mock customer stats - in real app, this would come from backend
      setCustomerStats({
        totalQueries: Math.floor(Math.random() * 20) + 5,
        resolvedQueries: Math.floor(Math.random() * 15) + 3,
        averageRating: 4.2 + Math.random() * 0.6,
        totalWaitTime: Math.floor(Math.random() * 120) + 30
      })
    } catch (error) {
      console.error('Error fetching customer stats:', error)
    }
  }

  const fetchConversationHistory = async () => {
    try {
      // Mock conversation history
      const mockHistory = [
        {
          id: '1',
          date: '2024-01-15',
          agent: 'Sarah Chen',
          issue: 'Account Login Issue',
          status: 'Resolved',
          rating: 5,
          duration: '12 minutes',
          summary: 'Customer had trouble logging into their account. Agent helped reset password and enabled 2FA for security.',
          keyPoints: ['Password reset completed', '2FA enabled', 'Security tips provided']
        },
        {
          id: '2',
          date: '2024-01-10',
          agent: 'Marcus Johnson',
          issue: 'Billing Question',
          status: 'Resolved',
          rating: 4,
          duration: '8 minutes',
          summary: 'Customer inquired about billing cycle and payment methods. Agent explained billing process and updated payment info.',
          keyPoints: ['Billing cycle explained', 'Payment method updated', 'Auto-pay enabled']
        }
      ]
      setConversationHistory(mockHistory)
    } catch (error) {
      console.error('Error fetching conversation history:', error)
    }
  }

  const handleSubmitQuery = async () => {
    try {
      const response = await fetch('http://localhost:8000/customer/submit-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: user.email,
          customer_name: user.name,
          ...queryData
        })
      })

      const data = await response.json()

      if (response.ok) {
        setQuerySubmitted(true)
        setQueuePosition(data.queue_position || 1)
        setEstimatedWait(data.estimated_wait_time || 15)
        setShowQueryForm(false)

        // Simulate agent assignment after a delay
        setTimeout(() => {
          const randomAgent = agents[Math.floor(Math.random() * agents.length)]
          setAssignedAgent(randomAgent)

          // Simulate conversation completion after another delay
          setTimeout(() => {
            setConversationCompleted(true)
          }, 30000) // 30 seconds for demo
        }, 10000) // 10 seconds for demo
      } else {
        alert('Failed to submit query: ' + data.error)
      }
    } catch (error) {
      alert('Failed to submit query. Please try again.')
    }
  }

  const issueTypes = [
    { value: 'technical_support', label: 'Technical Support', icon: '🔧' },
    { value: 'billing', label: 'Billing', icon: '💳' },
    { value: 'account_management', label: 'Account Management', icon: '👤' },
    { value: 'sales', label: 'Sales', icon: '💼' },
    { value: 'product_inquiry', label: 'Product Inquiry', icon: '❓' },
    { value: 'complaint_resolution', label: 'Complaint Resolution', icon: '⚠️' }
  ]

  const channelOptions = [
    { value: 'phone', label: 'Phone Call', icon: Phone },
    { value: 'chat', label: 'Live Chat', icon: MessageSquare },
    { value: 'email', label: 'Email', icon: Mail }
  ]

  // Enhanced Export Function with Multiple Formats
  const generateConversationReport = (conversation: any, format: string) => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `conversation-report-${conversation.id}-${timestamp}`

    if (format === 'json') {
      // JSON Format
      const jsonData = {
        reportInfo: {
          title: "Smart Queue Routing System - Conversation Report",
          generatedOn: new Date().toISOString(),
          conversationId: conversation.id
        },
        conversationDetails: {
          issue: conversation.issue,
          date: conversation.date,
          agent: conversation.agent,
          duration: conversation.duration,
          status: conversation.status,
          rating: conversation.rating
        },
        summary: conversation.summary,
        keyPoints: conversation.keyPoints || [],
        metadata: {
          exportFormat: "JSON",
          version: "1.0"
        }
      }

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      downloadFile(blob, `${filename}.json`)

    } else if (format === 'txt') {
      // Plain Text Format
      const textContent = `
SMART QUEUE ROUTING SYSTEM
Conversation Report
Generated on: ${new Date().toLocaleDateString()}

===========================================

CONVERSATION DETAILS:
Issue: ${conversation.issue}
Date: ${conversation.date}
Agent: ${conversation.agent}
Duration: ${conversation.duration}
Status: ${conversation.status}
Rating: ${'★'.repeat(conversation.rating)}${'☆'.repeat(5 - conversation.rating)} (${conversation.rating}/5)

===========================================

CONVERSATION SUMMARY:
${conversation.summary}

===========================================

KEY POINTS DISCUSSED:
${conversation.keyPoints?.map((point: string, i: number) => `${i + 1}. ${point}`).join('\n') || 'No key points recorded'}

===========================================

This report was generated by Smart Queue Routing System
For support, contact: support@sqrs.com
      `

      const blob = new Blob([textContent], { type: 'text/plain' })
      downloadFile(blob, `${filename}.txt`)

    } else if (format === 'csv') {
      // CSV Format
      const csvContent = `
"Field","Value"
"Report Title","Smart Queue Routing System - Conversation Report"
"Generated On","${new Date().toLocaleDateString()}"
"Conversation ID","${conversation.id}"
"Issue","${conversation.issue}"
"Date","${conversation.date}"
"Agent","${conversation.agent}"
"Duration","${conversation.duration}"
"Status","${conversation.status}"
"Rating","${conversation.rating}/5"
"Summary","${conversation.summary?.replace(/"/g, '""') || ''}"
"Key Points","${conversation.keyPoints?.join('; ') || 'None'}"
      `

      const blob = new Blob([csvContent], { type: 'text/csv' })
      downloadFile(blob, `${filename}.csv`)

    } else {
      // HTML/PDF Format (default)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Conversation Report - ${conversation.issue}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; color: #4F46E5; }
            .rating { color: #F59E0B; }
            .key-points { background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
            .detail-item { padding: 10px; background: #f8f9fa; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Smart Queue Routing System</h1>
            <h2>Conversation Report</h2>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          <div class="section">
            <h3>Conversation Details</h3>
            <div class="details-grid">
              <div class="detail-item"><span class="label">Issue:</span> ${conversation.issue}</div>
              <div class="detail-item"><span class="label">Date:</span> ${conversation.date}</div>
              <div class="detail-item"><span class="label">Agent:</span> ${conversation.agent}</div>
              <div class="detail-item"><span class="label">Duration:</span> ${conversation.duration}</div>
              <div class="detail-item"><span class="label">Status:</span> ${conversation.status}</div>
              <div class="detail-item"><span class="label">Rating:</span> <span class="rating">${'★'.repeat(conversation.rating)}${'☆'.repeat(5 - conversation.rating)} (${conversation.rating}/5)</span></div>
            </div>
          </div>
          
          <div class="section">
            <h3>Conversation Summary</h3>
            <p>${conversation.summary}</p>
          </div>
          
          <div class="section key-points">
            <h3>Key Points Discussed</h3>
            <ul>
              ${conversation.keyPoints?.map((point: string) => `<li>${point}</li>`).join('') || '<li>No key points recorded</li>'}
            </ul>
          </div>
          
          <div class="footer">
            <p><strong>Smart Queue Routing System</strong></p>
            <p>This report was automatically generated</p>
            <p>For support, contact: support@sqrs.com</p>
          </div>
        </body>
        </html>
      `

      const blob = new Blob([htmlContent], { type: 'text/html' })
      downloadFile(blob, `${filename}.html`)
    }
  }

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Customer Portal</h1>
                <p className="text-white/70">Welcome back, {user?.name || 'Customer'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation Tabs */}
              <nav className="flex space-x-1 bg-white/10 rounded-2xl p-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'queue', label: 'Queue', icon: Users },
                  { id: 'history', label: 'History', icon: History },
                  { id: 'agents', label: 'Agents', icon: User }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Profile & Logout */}
              <button
                onClick={() => setShowProfile(true)}
                className="p-2 bg-white/10 text-white/70 rounded-xl hover:bg-white/20 hover:text-white transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>

              <button
                onClick={onLogout}
                className="flex items-center space-x-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-xl hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-400" />
                  <span className="text-2xl font-bold text-white">{customerStats.totalQueries}</span>
                </div>
                <h3 className="text-white font-semibold">Total Queries</h3>
                <p className="text-white/70 text-sm">All time submissions</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <span className="text-2xl font-bold text-white">{customerStats.resolvedQueries}</span>
                </div>
                <h3 className="text-white font-semibold">Resolved</h3>
                <p className="text-white/70 text-sm">Successfully completed</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Star className="h-8 w-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{customerStats.averageRating.toFixed(1)}</span>
                </div>
                <h3 className="text-white font-semibold">Avg Rating</h3>
                <p className="text-white/70 text-sm">Service satisfaction</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-purple-400" />
                  <span className="text-2xl font-bold text-white">{customerStats.totalWaitTime}m</span>
                </div>
                <h3 className="text-white font-semibold">Wait Time</h3>
                <p className="text-white/70 text-sm">Total time waited</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Submit New Query */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Send className="h-6 w-6 text-blue-400" />
                  <span>Submit New Query</span>
                </h2>

                {!querySubmitted ? (
                  <div className="space-y-4">
                    <p className="text-white/70">Need help? Submit a support query and get matched with the best agent for your needs.</p>
                    <button
                      onClick={() => setShowQueryForm(true)}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-2xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
                    >
                      Start New Query
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                    <h3 className="text-xl font-semibold text-white">Query Submitted!</h3>
                    <p className="text-white/70">Your query has been submitted and you're in the queue.</p>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70">Queue Position:</span>
                        <span className="text-white font-semibold">#{queuePosition}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Estimated Wait:</span>
                        <span className="text-white font-semibold">{estimatedWait} minutes</span>
                      </div>
                    </div>

                    {assignedAgent && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mt-4">
                        <h4 className="text-green-300 font-semibold mb-2">Agent Assigned!</h4>
                        <p className="text-white">You've been connected with {assignedAgent.name}</p>
                        <p className="text-white/70 text-sm">Specializes in: {assignedAgent.specialty.join(', ')}</p>
                      </div>
                    )}

                    {conversationCompleted && (
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowConversationSummary(true)}
                          className="w-full bg-blue-500/20 text-blue-300 py-2 rounded-xl hover:bg-blue-500/30 transition-colors"
                        >
                          View Conversation Summary
                        </button>
                        <button
                          onClick={() => setShowFeedbackForm(true)}
                          className="w-full bg-yellow-500/20 text-yellow-300 py-2 rounded-xl hover:bg-yellow-500/30 transition-colors"
                        >
                          Leave Feedback
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <History className="h-6 w-6 text-purple-400" />
                  <span>Recent Activity</span>
                </h2>

                <div className="space-y-4">
                  {conversationHistory.slice(0, 3).map((conversation, index) => (
                    <div key={conversation.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium">{conversation.issue}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${conversation.status === 'Resolved'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                          {conversation.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-white/70">
                        <span>Agent: {conversation.agent}</span>
                        <span>{conversation.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < conversation.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-white/70 text-xs">{conversation.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Queue Tab */}
        {activeTab === 'queue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Queue Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-blue-400" />
                  <span className="text-2xl font-bold text-white">{customers.length}</span>
                </div>
                <h3 className="text-white font-semibold">Total in Queue</h3>
                <p className="text-white/70 text-sm">Waiting customers</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{Math.round(customers.reduce((acc, c) => acc + c.wait_time, 0) / customers.length / 60) || 0}m</span>
                </div>
                <h3 className="text-white font-semibold">Avg Wait</h3>
                <p className="text-white/70 text-sm">Current average</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Zap className="h-8 w-8 text-red-400" />
                  <span className="text-2xl font-bold text-white">{customers.filter(c => c.priority >= 8).length}</span>
                </div>
                <h3 className="text-white font-semibold">High Priority</h3>
                <p className="text-white/70 text-sm">Urgent requests</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-green-400" />
                  <span className="text-2xl font-bold text-white">{queuePosition || '-'}</span>
                </div>
                <h3 className="text-white font-semibold">Your Position</h3>
                <p className="text-white/70 text-sm">In queue</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Users className="h-6 w-6 text-cyan-400" />
                  <span>Current Queue Status</span>
                </h2>

                {!querySubmitted && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                    <p className="text-blue-300 text-sm flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Submit a query to see detailed queue information</span>
                    </p>
                  </div>
                )}
              </div>

              {querySubmitted && (
                <div className="mb-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
                  <h3 className="text-xl font-semibold text-white mb-4">Your Position Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-300">#{queuePosition}</div>
                      <div className="text-blue-200 text-sm">Queue Position</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-300">{estimatedWait}m</div>
                      <div className="text-cyan-200 text-sm">Estimated Wait</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-300">{customers.length}</div>
                      <div className="text-green-200 text-sm">Total in Queue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-300">{queuePosition > 0 ? queuePosition - 1 : 0}</div>
                      <div className="text-purple-200 text-sm">Ahead of You</div>
                    </div>
                  </div>

                  {assignedAgent && (
                    <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                        <div>
                          <h4 className="text-green-300 font-semibold">Agent Assigned!</h4>
                          <p className="text-white">You're now connected with {assignedAgent.name}</p>
                          <p className="text-white/70 text-sm">Specializes in: {assignedAgent.specialty.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Queue Overview</h3>
                  <div className="flex items-center space-x-4 text-sm text-white/70">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>High Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium Priority</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Low Priority</span>
                    </div>
                  </div>
                </div>

                {customers.slice(0, 15).map((customer, index) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-colors ${customer.name === user.name ? 'ring-2 ring-blue-400 bg-blue-500/10' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-white">
                              {customer.name === user.name ? 'You' : customer.name}
                            </h4>
                            {customer.name === user.name && (
                              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                                Your Request
                              </span>
                            )}
                          </div>

                          {/* Show Token ID for all customers */}
                          <p className="text-xs text-white/50 font-mono">Token: {customer.id.slice(0, 8)}...</p>

                          {/* Show detailed info only if user has submitted a query OR it's their own request */}
                          {(querySubmitted || customer.name === user.name) && (
                            <>
                              <p className="text-sm text-white/70">{customer.issue_type.replace(/_/g, ' ')}</p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-white/60">
                                <span>Tier: {customer.tier}</span>
                                <span>Channel: {customer.channel}</span>
                                <span>Complexity: {customer.issue_complexity}/5</span>
                              </div>
                            </>
                          )}

                          {/* Show minimal info if user hasn't submitted a query and it's not their request */}
                          {!querySubmitted && customer.name !== user.name && (
                            <p className="text-sm text-white/50">Customer in queue</p>
                          )}
                        </div>
                      </div>

                      {/* Show detailed right side info only if user has submitted a query OR it's their own request */}
                      {(querySubmitted || customer.name === user.name) ? (
                        <div className="text-right space-y-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${customer.priority >= 8 ? 'bg-red-500/20 text-red-300' :
                              customer.priority >= 5 ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-green-500/20 text-green-300'
                            }`}>
                            Priority {customer.priority}
                          </div>

                          <div className="text-white/70 text-xs">
                            <div>Wait: {Math.floor(customer.wait_time / 60)}m {customer.wait_time % 60}s</div>
                            <div className={`${customer.sentiment === 'positive' ? 'text-green-400' :
                                customer.sentiment === 'negative' ? 'text-red-400' :
                                  'text-yellow-400'
                              }`}>
                              {customer.sentiment}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                            Waiting
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {customers.length > 15 && (
                  <div className="text-center py-4">
                    <span className="text-white/70 text-sm">
                      ... and {customers.length - 15} more customers in queue
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <History className="h-6 w-6 text-purple-400" />
                <span>Conversation History</span>
              </h2>

              <div className="space-y-6">
                {conversationHistory.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-2xl p-6 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{conversation.issue}</h3>
                        <p className="text-white/70">Agent: {conversation.agent}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${conversation.status === 'Resolved'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                          {conversation.status}
                        </span>
                        <p className="text-white/70 text-sm mt-1">{conversation.date}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-2">Summary:</h4>
                      <p className="text-white/80 text-sm">{conversation.summary}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-2">Key Points:</h4>
                      <ul className="space-y-1">
                        {conversation.keyPoints.map((point: string, i: number) => (
                          <li key={i} className="text-white/80 text-sm flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-white/70 text-sm">Rating:</span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < conversation.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white/70 text-sm">Duration: {conversation.duration}</span>
                        <div className="relative">
                          <button
                            onClick={() => setShowDownloadMenu(showDownloadMenu === conversation.id ? null : conversation.id)}
                            className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                            title="Download Conversation Report"
                          >
                            <Download className="h-4 w-4" />
                          </button>

                          {showDownloadMenu === conversation.id && (
                            <div className="absolute right-0 top-full mt-2 bg-slate-800/95 backdrop-blur-md border border-white/20 rounded-xl p-2 min-w-[150px] z-50">
                              <div className="text-white/70 text-xs mb-2 px-2">Export Format:</div>
                              {[
                                { format: 'html', label: 'HTML Report', icon: '🌐', desc: 'Web page format' },
                                { format: 'json', label: 'JSON Data', icon: '📊', desc: 'Structured data' },
                                { format: 'txt', label: 'Text File', icon: '📄', desc: 'Plain text format' },
                                { format: 'csv', label: 'CSV Export', icon: '📈', desc: 'Spreadsheet format' }
                              ].map((option) => (
                                <button
                                  key={option.format}
                                  onClick={() => {
                                    generateConversationReport(conversation, option.format)
                                    setShowDownloadMenu(null)
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white text-sm flex items-center space-x-3"
                                >
                                  <span className="text-lg">{option.icon}</span>
                                  <div>
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-xs text-white/60">{option.desc}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Agents Tab */}
        {activeTab === 'agents' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Agent Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-green-400" />
                  <span className="text-2xl font-bold text-white">{agents.filter(a => a.status === 'available').length}</span>
                </div>
                <h3 className="text-white font-semibold">Available</h3>
                <p className="text-white/70 text-sm">Ready to help</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="h-8 w-8 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">{agents.filter(a => a.status === 'busy').length}</span>
                </div>
                <h3 className="text-white font-semibold">Busy</h3>
                <p className="text-white/70 text-sm">Currently helping</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                  <span className="text-2xl font-bold text-white">{Math.round(agents.reduce((acc, a) => acc + a.past_success_rate, 0) / agents.length * 100)}%</span>
                </div>
                <h3 className="text-white font-semibold">Avg Success</h3>
                <p className="text-white/70 text-sm">Team performance</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-purple-400" />
                  <span className="text-2xl font-bold text-white">{Math.round(agents.reduce((acc, a) => acc + a.avg_handling_time, 0) / agents.length)}m</span>
                </div>
                <h3 className="text-white font-semibold">Avg Time</h3>
                <p className="text-white/70 text-sm">Resolution time</p>
              </div>
            </div>

            {/* Available Agents */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Users className="h-6 w-6 text-cyan-400" />
                <span>Available Agents</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.filter(agent => agent.status === 'available').map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-lg">{agent.name}</h3>
                          <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                            Available Now
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 text-sm">
                      {/* Primary Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-white/70 mb-1">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            <span className="text-xs">Experience</span>
                          </div>
                          <div className="text-white font-semibold">{agent.experience} years</div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-white/70 mb-1">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs">Success Rate</span>
                          </div>
                          <div className="text-white font-semibold">{Math.round(agent.past_success_rate * 100)}%</div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <h4 className="text-white font-medium mb-2 text-xs">Performance Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-xs">Avg Response Time:</span>
                            <span className="text-white text-xs">{agent.avg_handling_time}m</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-xs">Current Load:</span>
                            <span className="text-white text-xs">{agent.current_workload}/{agent.max_concurrent}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-xs">Availability:</span>
                            <span className="text-green-300 text-xs">Online</span>
                          </div>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <h4 className="text-white font-medium mb-2 text-xs flex items-center space-x-1">
                          <Award className="h-3 w-3 text-blue-400" />
                          <span>Specialties</span>
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {agent.specialty.map((spec, i) => (
                            <span key={i} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                              {spec.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Skills Breakdown */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <h4 className="text-white font-medium mb-2 text-xs">Skill Proficiency</h4>
                        <div className="space-y-2">
                          {Object.entries(agent.skills || {}).slice(0, 4).map(([skill, level]) => (
                            <div key={skill} className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-white/70 text-xs capitalize">{skill.replace(/_/g, ' ')}</span>
                                <span className="text-white text-xs">{Math.round((level as number) * 100)}%</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-1">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1 rounded-full"
                                  style={{ width: `${(level as number) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Preference */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <h4 className="text-white font-medium mb-2 text-xs">Best For</h4>
                        <div className="flex items-center space-x-2">
                          {agent.specialty.includes('technical_support') && (
                            <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">Tech Issues</span>
                          )}
                          {agent.specialty.includes('billing') && (
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">Billing</span>
                          )}
                          {agent.specialty.includes('sales') && (
                            <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded text-xs">Sales</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* All Agents Performance Overview */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-purple-400" />
                <span>Team Performance Overview</span>
              </h2>

              <div className="space-y-4">
                {agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white text-lg">{agent.name}</h4>
                          <p className="text-sm text-white/70">{agent.specialty[0]?.replace(/_/g, ' ')} Specialist</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-white/60">{agent.experience} years exp</span>
                            <span className="text-xs text-white/60">ID: {agent.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-8 text-sm">
                        <div className="text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${agent.status === 'available' ? 'bg-green-500/20 text-green-300' :
                              agent.status === 'busy' ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-gray-500/20 text-gray-300'
                            }`}>
                            {agent.status}
                          </span>
                          <div className="text-white/70 text-xs mt-1">Status</div>
                        </div>

                        <div className="text-center text-white/70">
                          <div className="text-white font-medium text-lg">{Math.round(agent.past_success_rate * 100)}%</div>
                          <div className="text-xs">Success Rate</div>
                        </div>

                        <div className="text-center text-white/70">
                          <div className="text-white font-medium text-lg">{agent.avg_handling_time}m</div>
                          <div className="text-xs">Avg Time</div>
                        </div>

                        <div className="text-center text-white/70">
                          <div className="text-white font-medium text-lg">{agent.current_workload}/{agent.max_concurrent}</div>
                          <div className="text-xs">Workload</div>
                        </div>

                        <div className="text-center text-white/70">
                          <div className="text-white font-medium text-lg">{Object.keys(agent.skills || {}).length}</div>
                          <div className="text-xs">Skills</div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Skills Bar */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/70 text-sm">Skill Distribution</span>
                        <span className="text-white/70 text-xs">Proficiency Level</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(agent.skills || {}).slice(0, 4).map(([skill, level]) => (
                          <div key={skill} className="bg-white/5 rounded-lg p-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-white/70 text-xs capitalize">{skill.replace(/_/g, ' ')}</span>
                              <span className="text-white text-xs">{Math.round((level as number) * 100)}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${(level as number) >= 0.8 ? 'bg-green-500' :
                                    (level as number) >= 0.6 ? 'bg-yellow-500' :
                                      'bg-red-500'
                                  }`}
                                style={{ width: `${(level as number) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Query Form Modal */}
      {showQueryForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Submit Your Query</h2>

            <div className="space-y-6">
              <div>
                <label className="text-white font-medium block mb-2">Issue Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {issueTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setQueryData({ ...queryData, issue_type: type.value })}
                      className={`p-3 rounded-xl border text-left transition-all ${queryData.issue_type === type.value
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{type.icon}</span>
                        <span className="text-sm font-medium">{type.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white font-medium block mb-2">Describe Your Issue</label>
                <textarea
                  value={queryData.issue_description}
                  onChange={(e) => setQueryData({ ...queryData, issue_description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 h-32 resize-none"
                  placeholder="Please describe your issue in detail..."
                />
              </div>

              <div>
                <label className="text-white font-medium block mb-2">Preferred Channel</label>
                <div className="grid grid-cols-3 gap-3">
                  {channelOptions.map((channel) => (
                    <button
                      key={channel.value}
                      onClick={() => setQueryData({ ...queryData, channel: channel.value })}
                      className={`p-4 rounded-xl border transition-all ${queryData.channel === channel.value
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                    >
                      <channel.icon className="h-6 w-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">{channel.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white font-medium block mb-2">Priority Level: {queryData.priority}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={queryData.priority}
                  onChange={(e) => setQueryData({ ...queryData, priority: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer slider accent-blue-500"
                />
                <div className="flex justify-between text-xs text-white/70 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowQueryForm(false)}
                  className="flex-1 bg-white/10 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuery}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  Submit Query
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modals */}
      <CustomerProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        customerStats={customerStats}
      />

      <ConversationSummaryModal
        isOpen={showConversationSummary}
        onClose={() => setShowConversationSummary(false)}
        conversation={conversationHistory[0]} // Most recent conversation
        agent={assignedAgent}
      />

      <FeedbackFormModal
        isOpen={showFeedbackForm}
        onClose={() => setShowFeedbackForm(false)}
        agent={assignedAgent}
        conversationId={conversationHistory[0]?.id}
      />
    </div>
  )
}

export default CustomerDashboard