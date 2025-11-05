import * as React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Users, 
  MessageCircle, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  Star,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { Agent } from '../types'

interface CustomerDashboardProps {
  user: any
  onLogout: () => void
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onLogout }) => {
  const { theme } = useTheme()
  const [agents, setAgents] = React.useState<Agent[]>([])
  const [querySubmitted, setQuerySubmitted] = React.useState(false)
  const [queuePosition, setQueuePosition] = React.useState(0)
  const [estimatedWait, setEstimatedWait] = React.useState(0)
  const [showQueryForm, setShowQueryForm] = React.useState(false)
  
  const [queryData, setQueryData] = React.useState({
    sentiment: 'neutral',
    tier: 'standard',
    issue_type: 'technical_support',
    issue_description: '',
    channel: 'phone',
    priority: 5,
    issue_complexity: 3
  })

  // Fetch agents on component mount
  React.useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:8000/agents')
      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    }
  }

  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
        setQueuePosition(data.queue_position)
        setEstimatedWait(data.estimated_wait_time)
        setShowQueryForm(false)
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
                <p className="text-sm text-white/70">Welcome, {user.name}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!querySubmitted ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Submit Query Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <MessageCircle className="h-6 w-6 text-blue-400" />
                  <span>Submit Your Query</span>
                </h2>
                
                {!showQueryForm ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-10 w-10 text-white" />
                    </div>
                    <p className="text-white/80 mb-6">
                      Need help? Submit your query and get connected with the right agent.
                    </p>
                    <button
                      onClick={() => setShowQueryForm(true)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Start New Query
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitQuery} className="space-y-4">
                    <div>
                      <label className="text-white font-medium block mb-2">Issue Type</label>
                      <select
                        value={queryData.issue_type}
                        onChange={(e) => setQueryData({ ...queryData, issue_type: e.target.value })}
                        className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-blue-400/30 rounded-xl px-4 py-3 text-white"
                      >
                        {issueTypes.map((type) => (
                          <option key={type.value} value={type.value} className="bg-slate-800 text-white">
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-white font-medium block mb-2">Describe Your Issue</label>
                      <textarea
                        value={queryData.issue_description}
                        onChange={(e) => setQueryData({ ...queryData, issue_description: e.target.value })}
                        rows={4}
                        className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-blue-400/30 rounded-xl px-4 py-3 text-white placeholder-white/50"
                        placeholder="Please describe your issue in detail..."
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white font-medium block mb-2">Priority (1-10)</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={queryData.priority}
                          onChange={(e) => setQueryData({ ...queryData, priority: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="text-center text-blue-400 font-bold">{queryData.priority}</div>
                      </div>

                      <div>
                        <label className="text-white font-medium block mb-2">Preferred Channel</label>
                        <select
                          value={queryData.channel}
                          onChange={(e) => setQueryData({ ...queryData, channel: e.target.value })}
                          className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-cyan-400/30 rounded-xl px-4 py-3 text-white"
                        >
                          {channelOptions.map((channel) => (
                            <option key={channel.value} value={channel.value} className="bg-slate-800 text-white">
                              {channel.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowQueryForm(false)}
                        className="flex-1 bg-white/10 backdrop-blur-md text-white font-semibold py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Submit Query</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Available Agents */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Users className="h-6 w-6 text-cyan-400" />
                  <span>Available Agents</span>
                </h2>
                
                <div className="space-y-4">
                  {agents.filter(agent => agent.status === 'available').map((agent, index) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{agent.name}</h3>
                        <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                          Available
                        </span>
                      </div>
                      <div className="text-sm text-white/70 space-y-1">
                        <p>Specialties: {agent.specialty.join(', ').replace(/_/g, ' ')}</p>
                        <p>Experience: {agent.experience} years</p>
                        <div className="flex items-center space-x-2">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span>{Math.round(agent.past_success_rate * 100)}% success rate</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Query Submitted Status */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Query Submitted Successfully!</h2>
              <p className="text-white/80 mb-8">
                Your query has been added to the queue. You'll be connected with an agent soon.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-blue-400 mb-1">#{queuePosition}</div>
                  <div className="text-white/70 text-sm">Position in Queue</div>
                </div>
                <div className="bg-white/5 rounded-2xl p-4">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">{estimatedWait}m</div>
                  <div className="text-white/70 text-sm">Estimated Wait</div>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  💡 You'll receive updates about your query status. An agent will be assigned to you shortly.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setQuerySubmitted(false)
                  setShowQueryForm(false)
                }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                Submit Another Query
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

export default CustomerDashboard