import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, AlertTriangle, Phone, MessageSquare, X, Bell } from 'lucide-react'

interface TimeNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'warning' | 'expired'
  timeRemaining?: number
  customerName: string
  agentName: string
  onEndConversation: () => void
  onSendSMS: () => void
}

const TimeNotificationModal: React.FC<TimeNotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  timeRemaining = 0,
  customerName,
  agentName,
  onEndConversation,
  onSendSMS
}) => {
  const [smsStatus, setSmsStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendSMS = async () => {
    setSmsStatus('sending')
    try {
      await onSendSMS()
      setSmsStatus('sent')
      setTimeout(() => setSmsStatus('idle'), 3000)
    } catch (error) {
      setSmsStatus('error')
      setTimeout(() => setSmsStatus('idle'), 3000)
    }
  }

  const getModalContent = () => {
    if (type === 'warning') {
      return {
        icon: <Clock className="h-12 w-12 text-orange-400" />,
        title: 'Conversation Time Warning',
        message: `You have ${formatTime(timeRemaining)} remaining in your conversation with ${type === 'warning' ? customerName : agentName}.`,
        bgColor: 'from-orange-500/20 to-yellow-500/20',
        borderColor: 'border-orange-500/30',
        buttonColor: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border-orange-500/30'
      }
    } else {
      return {
        icon: <AlertTriangle className="h-12 w-12 text-red-400" />,
        title: 'Time Limit Exceeded',
        message: `Your 10-minute conversation limit has been reached. Please end the conversation with ${type === 'warning' ? customerName : agentName} immediately.`,
        bgColor: 'from-red-500/20 to-pink-500/20',
        borderColor: 'border-red-500/30',
        buttonColor: 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30'
      }
    }
  }

  const content = getModalContent()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`bg-gradient-to-br ${content.bgColor} backdrop-blur-md rounded-3xl border ${content.borderColor} w-full max-w-md shadow-2xl`}>
              {/* Header */}
              <div className="p-6 text-center">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md rounded-xl text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
                >
                  <X className="h-4 w-4" />
                </button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mb-4"
                >
                  {content.icon}
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-3">
                  {content.title}
                </h2>

                <p className="text-white/80 mb-6 leading-relaxed">
                  {content.message}
                </p>

                {/* Conversation Details */}
                <div className="bg-white/10 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-blue-300" />
                      <span className="text-white/70">Conversation</span>
                    </div>
                    <span className="text-white font-medium">
                      {customerName} ↔ {agentName}
                    </span>
                  </div>
                  
                  {type === 'warning' && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-orange-300" />
                        <span className="text-white/70">Time Remaining</span>
                      </div>
                      <span className="text-orange-300 font-mono font-bold">
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={onEndConversation}
                    className={`w-full ${content.buttonColor} font-semibold py-3 rounded-xl border transition-all duration-300 flex items-center justify-center space-x-2`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>End Conversation Now</span>
                  </button>

                  <button
                    onClick={handleSendSMS}
                    disabled={smsStatus === 'sending'}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold py-3 rounded-xl border border-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {smsStatus === 'sending' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-300"></div>
                        <span>Sending SMS...</span>
                      </>
                    ) : smsStatus === 'sent' ? (
                      <>
                        <Bell className="h-4 w-4" />
                        <span>SMS Sent!</span>
                      </>
                    ) : smsStatus === 'error' ? (
                      <>
                        <AlertTriangle className="h-4 w-4" />
                        <span>SMS Failed</span>
                      </>
                    ) : (
                      <>
                        <Phone className="h-4 w-4" />
                        <span>Send SMS Alert to Customer</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full bg-white/10 hover:bg-white/20 text-white/70 font-medium py-2 rounded-xl transition-all duration-300"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default TimeNotificationModal