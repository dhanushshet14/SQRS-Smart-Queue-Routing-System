import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, User, MessageCircle, CheckCircle, FileText, Star } from 'lucide-react'

interface ConversationSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  conversation: any
  agent: any
}

const ConversationSummaryModal: React.FC<ConversationSummaryModalProps> = ({
  isOpen,
  onClose,
  conversation,
  agent
}) => {
  if (!conversation) return null

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
                      <User className="h-4 w-4 text-blue-400" />
                      <span className="text-white/70 text-sm">Customer</span>
                    </div>
                    <p className="text-white font-semibold text-lg">You</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-green-400" />
                      <span className="text-white/70 text-sm">Agent</span>
                    </div>
                    <p className="text-white font-semibold text-lg">{agent?.name || conversation.agent}</p>
                  </div>
                </div>

                {/* Session Details */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl mb-1">📞</div>
                      <div className="text-white/70 text-xs">Channel</div>
                      <div className="text-white font-medium capitalize">Phone</div>
                    </div>
                    <div>
                      <Clock className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                      <div className="text-white/70 text-xs">Duration</div>
                      <div className="text-white font-medium">{conversation.duration}</div>
                    </div>
                    <div>
                      <MessageCircle className="h-6 w-6 text-green-400 mx-auto mb-1" />
                      <div className="text-white/70 text-xs">Issue Type</div>
                      <div className="text-white font-medium text-sm">{conversation.issue}</div>
                    </div>
                  </div>
                </div>

                {/* Resolution Summary */}
                <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-4 border border-green-500/30">
                  <h3 className="text-green-300 font-semibold mb-2 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Conversation Summary</span>
                  </h3>
                  <p className="text-white/80 text-sm">{conversation.summary}</p>
                </div>

                {/* Key Points */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Key Points Discussed</h3>
                  <ul className="space-y-2">
                    {conversation.keyPoints?.map((point: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2 text-white/80 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rating */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Your Rating</h3>
                  <div className="flex items-center space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < conversation.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                    <span className="text-white/70 ml-2">{conversation.rating}/5 stars</span>
                  </div>
                </div>

                {/* Close Button */}
                <div className="pt-4">
                  <button
                    onClick={onClose}
                    className="w-full bg-blue-500/20 text-blue-300 font-semibold py-3 rounded-xl hover:bg-blue-500/30 transition-colors"
                  >
                    Close Summary
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