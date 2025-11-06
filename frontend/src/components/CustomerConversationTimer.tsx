import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertTriangle, MessageSquare, Phone, User } from 'lucide-react'

interface CustomerConversationTimerProps {
  isActive: boolean
  agentName: string
  onTimeWarning: (timeRemaining: number) => void
  onTimeExpired: () => void
}

const CustomerConversationTimer: React.FC<CustomerConversationTimerProps> = ({
  isActive,
  agentName,
  onTimeWarning,
  onTimeExpired
}) => {
  const [timeElapsed, setTimeElapsed] = React.useState(0)
  const [showWarning, setShowWarning] = React.useState(false)
  const [showExpired, setShowExpired] = React.useState(false)

  const TIME_LIMIT = 10 * 60 // 10 minutes in seconds
  const WARNING_TIME = 8 * 60 // 8 minutes - show warning at 2 minutes remaining

  React.useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeElapsed(prev => {
        const newElapsed = prev + 1

        // Show warning at 8 minutes (2 minutes remaining)
        if (newElapsed >= WARNING_TIME && !showWarning) {
          setShowWarning(true)
          onTimeWarning(TIME_LIMIT - newElapsed)
        }

        // Time expired at 10 minutes
        if (newElapsed >= TIME_LIMIT && !showExpired) {
          setShowExpired(true)
          onTimeExpired()
        }

        return newElapsed
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, showWarning, showExpired, onTimeWarning, onTimeExpired])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeRemaining = () => {
    return Math.max(0, TIME_LIMIT - timeElapsed)
  }

  const getProgressPercentage = () => {
    return Math.min(100, (timeElapsed / TIME_LIMIT) * 100)
  }

  const getProgressColor = () => {
    const percentage = getProgressPercentage()
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (!isActive) return null

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-blue-300" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Active Conversation</h3>
            <p className="text-white/70 text-sm">with {agentName}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-white">
            {formatTime(timeElapsed)}
          </div>
          <div className="text-white/60 text-sm">
            {formatTime(getTimeRemaining())} remaining
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-white/70 mb-2">
          <span>Time Used</span>
          <span className={timeElapsed >= WARNING_TIME ? 'text-orange-400 font-medium' : ''}>
            {Math.round(getProgressPercentage())}%
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3">
          <motion.div
            className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
            animate={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/50 mt-1">
          <span>0:00</span>
          <span>10:00</span>
        </div>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {showWarning && !showExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-orange-300 font-medium">Time Warning</p>
                <p className="text-orange-200 text-sm">
                  You have {formatTime(getTimeRemaining())} remaining. Please wrap up your conversation.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {showExpired && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div>
                <p className="text-red-300 font-medium">Time Limit Reached</p>
                <p className="text-red-200 text-sm">
                  Your 10-minute conversation limit has been reached. The conversation will end shortly.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conversation Info */}
      <div className="bg-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-blue-300" />
            <span className="text-white/70">Agent</span>
          </div>
          <span className="text-white font-medium">{agentName}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-300" />
            <span className="text-white/70">Session Time</span>
          </div>
          <span className="text-green-300 font-mono">
            {formatTime(timeElapsed)} / 10:00
          </span>
        </div>
      </div>
    </div>
  )
}

export default CustomerConversationTimer