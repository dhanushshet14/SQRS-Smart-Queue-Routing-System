import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Phone, MessageSquare, AlertTriangle, CheckCircle, X } from 'lucide-react'

interface ConversationTimerProps {
  routingResult: any
  onEndConversation: (routingId: string) => void
  onTimeWarning: (routingId: string, timeRemaining: number) => void
  onTimeExpired: (routingId: string) => void
}

const ConversationTimer: React.FC<ConversationTimerProps> = ({
  routingResult,
  onEndConversation,
  onTimeWarning,
  onTimeExpired
}) => {
  const [timeElapsed, setTimeElapsed] = React.useState(0)
  const [showWarning, setShowWarning] = React.useState(false)
  const [showExpiredAlert, setShowExpiredAlert] = React.useState(false)
  const [isActive, setIsActive] = React.useState(true)

  const TIME_LIMIT = 10 * 60 // 10 minutes in seconds
  const WARNING_TIME = 8 * 60 // 8 minutes - show warning at 2 minutes remaining

  React.useEffect(() => {
    if (!isActive) return

    const startTime = new Date(routingResult.timestamp).getTime()
    
    const timer = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setTimeElapsed(elapsed)

      // Show warning at 8 minutes (2 minutes remaining)
      if (elapsed >= WARNING_TIME && !showWarning) {
        setShowWarning(true)
        onTimeWarning(routingResult.id, TIME_LIMIT - elapsed)
      }

      // Time expired at 10 minutes
      if (elapsed >= TIME_LIMIT && !showExpiredAlert) {
        setShowExpiredAlert(true)
        setIsActive(false)
        onTimeExpired(routingResult.id)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, routingResult.id, routingResult.timestamp, showWarning, showExpiredAlert, onTimeWarning, onTimeExpired])

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

  const handleEndConversation = () => {
    setIsActive(false)
    onEndConversation(routingResult.id)
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
      {/* Conversation Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-blue-300" />
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">
              {routingResult.customer_name} ↔ {routingResult.agent_name}
            </h4>
            <p className="text-white/60 text-xs">
              Score: {Math.round(routingResult.routing_score * 100)}%
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-white font-mono text-sm">
              {formatTime(timeElapsed)}
            </div>
            <div className="text-white/60 text-xs">
              -{formatTime(getTimeRemaining())}
            </div>
          </div>
          <Clock className={`h-4 w-4 ${timeElapsed >= WARNING_TIME ? 'text-orange-400' : 'text-blue-400'}`} />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full transition-all duration-1000 ${getProgressColor()}`}
            style={{ width: `${getProgressPercentage()}%` }}
            animate={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>0:00</span>
          <span className={timeElapsed >= WARNING_TIME ? 'text-orange-400 font-medium' : ''}>
            {timeElapsed >= TIME_LIMIT ? 'EXPIRED' : `${formatTime(getTimeRemaining())} left`}
          </span>
          <span>10:00</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleEndConversation}
          className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-medium py-2 rounded-lg transition-all duration-300 border border-green-500/30 flex items-center justify-center space-x-1"
        >
          <CheckCircle className="h-3 w-3" />
          <span>End Conversation</span>
        </button>
        
        {timeElapsed >= TIME_LIMIT && (
          <button
            onClick={() => setShowExpiredAlert(false)}
            className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-all duration-300 border border-red-500/30"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Warning Alert */}
      <AnimatePresence>
        {showWarning && timeElapsed < TIME_LIMIT && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 bg-orange-500/20 border border-orange-500/30 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <div>
                <p className="text-orange-300 text-sm font-medium">
                  Time Warning
                </p>
                <p className="text-orange-200 text-xs">
                  {formatTime(getTimeRemaining())} remaining. Please wrap up the conversation.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expired Alert */}
      <AnimatePresence>
        {showExpiredAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-3 bg-red-500/20 border border-red-500/30 rounded-lg p-3"
          >
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <div>
                <p className="text-red-300 text-sm font-medium">
                  Time Limit Exceeded
                </p>
                <p className="text-red-200 text-xs">
                  10-minute limit reached. Please end the conversation immediately.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConversationTimer