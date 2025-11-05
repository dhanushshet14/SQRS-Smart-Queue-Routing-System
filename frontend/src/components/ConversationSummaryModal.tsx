import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, User, MessageCircle, CheckCircle, FileText, Star } from 'lucide-react'

interface ConversationSummary {
  routing_id: string
  customer_name: string
  agent_name: string
  channel: string
  start_time: string
  end_time: string
  duration_minutes: number
  issue_type: string
  issue_description: string
  resolution_summary: string
  key_points: string[]
  actions_taken: string[]
  follow_up_required: boolean
  follow_up_notes?: string
}

interface ConversationSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  summary: ConversationSummary | null
  onSubmitFeedback: () => void
}

const ConversationSummaryModal: React.FC<ConversationSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  onSubmitFeedback
}) => {
  if (!summary) return null

  const channelIcons = {
    phone: '📞',
    chat: '💬',
    email: '📧',
    voice: '🎤'
  }

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
            <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-3xl border border-white/20 w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-warm-gradient p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Conversation Summary</h2>
                    <p className="text-white/80">Interaction completed successfully</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-warm-orange" />
                      <span className="text-white/70 text-sm">Customer</span>
                    </div>
                    <p className="text-white font-semibold text-lg">{summary.customer_name}</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-warm-teal" />
                      <span className="text-white/70 text-sm">Agent</span>
                    </div>
                    <p className="text-white font-semibold text-lg">{summary.agent_name}</p>
                  </div>
                </div>

                {/* Session Details */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl mb-1">{channelIcons[summary.channel as keyof typeof channelIcons] || '📞'}</div>
                      <div className="text-white/70 text-xs">Channel</div>
                      <div className="text-white font-medium capitalize">{summary.channel}</div>
                    </div>
                    <div>
                      <Clock className="h-6 w-6 text-warm-orange mx-auto mb-1" />
                      <div className="text-white/70 text-xs">Duration</div>
                      <div className="text-white font-medium">{summary.duration_minutes} min</div>
                    </div>
                    <div>
                      <MessageCircle className="h-6 w-6 text-warm-teal mx-auto mb-1" />
                      <div className="text-white/70 text-xs">Issue Type</div>
                      <div className="text-white font-medium text-sm">{summary.issue_type.replace('_', ' ')}</div>
                    </div>
                  </div>
                </div>

                {/* Issue Description */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-2 flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-warm-pink" />
                    <span>Issue Description</span>
                  </h3>
                  <p className="text-white/80 text-sm">{summary.issue_description}</p>
                </div>

                {/* Resolution Summary */}
                <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30">
                  <h3 className="text-green-300 font-semibold mb-2 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Resolution</span>
                  </h3>
                  <p className="text-white/80 text-sm">{summary.resolution_summary}</p>
                </div>

                {/* Key Points */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Key Discussion Points</h3>
                  <ul className="space-y-2">
                    {summary.key_points.map((point, index) => (
                      <li key={index} className="flex items-start space-x-2 text-white/80 text-sm">
                        <span className="text-warm-orange mt-1">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions Taken */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Actions Taken</h3>
                  <ul className="space-y-2">
                    {summary.actions_taken.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2 text-white/80 text-sm">
                        <CheckCircle className="h-4 w-4 text-warm-teal mt-0.5 flex-shrink-0" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Follow-up */}
                {summary.follow_up_required && (
                  <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-4 border border-blue-500/30">
                    <h3 className="text-blue-300 font-semibold mb-2">Follow-up Required</h3>
                    <p className="text-white/80 text-sm">{summary.follow_up_notes || 'Follow-up scheduled'}</p>
                  </div>
                )}

                {/* Feedback Button */}
                <div className="pt-4">
                  <button
                    onClick={() => {
                      onClose()
                      onSubmitFeedback()
                    }}
                    className="w-full bg-warm-gradient text-white font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                  >
                    <Star className="h-5 w-5" />
                    <span>Rate Your Experience</span>
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

export default ConversationSummaryModal