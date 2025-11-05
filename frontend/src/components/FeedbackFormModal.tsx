import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, ThumbsUp, MessageSquare, Send } from 'lucide-react'

interface FeedbackFormModalProps {
  isOpen: boolean
  onClose: () => void
  routingId: string
  customerName: string
  agentName: string
  onSubmit: (feedback: any) => void
}

const FeedbackFormModal: React.FC<FeedbackFormModalProps> = ({
  isOpen,
  onClose,
  routingId,
  customerName,
  agentName,
  onSubmit
}) => {
  const [ratings, setRatings] = React.useState({
    satisfaction_score: 5,
    agent_professionalism: 5,
    issue_resolution: 5,
    wait_time_satisfaction: 4
  })
  
  const [wouldRecommend, setWouldRecommend] = React.useState(true)
  const [comments, setComments] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSubmit({
        ...ratings,
        would_recommend: wouldRecommend,
        comments
      })
      onClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const StarRating = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) => (
    <div className="mb-4">
      <label className="text-white font-medium block mb-2">{label}</label>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-all duration-200 hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-warm-orange text-warm-orange'
                  : 'text-white/30'
              }`}
            />
          </button>
        ))}
        <span className="text-warm-orange font-bold ml-2 self-center">{value}/5</span>
      </div>
    </div>
  )

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
            <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-3xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
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
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Rate Your Experience</h2>
                    <p className="text-white/80">Help us improve our service</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(90vh-150px)] overflow-y-auto">
                {/* Agent Info */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
                  <p className="text-white/70 text-sm mb-1">You were assisted by</p>
                  <p className="text-white font-semibold text-lg">{agentName}</p>
                </div>

                {/* Overall Satisfaction */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <StarRating
                    value={ratings.satisfaction_score}
                    onChange={(val) => setRatings({ ...ratings, satisfaction_score: val })}
                    label="Overall Satisfaction"
                  />
                </div>

                {/* Detailed Ratings */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4">
                  <h3 className="text-white font-semibold mb-4">Detailed Ratings</h3>
                  
                  <StarRating
                    value={ratings.agent_professionalism}
                    onChange={(val) => setRatings({ ...ratings, agent_professionalism: val })}
                    label="Agent Professionalism"
                  />
                  
                  <StarRating
                    value={ratings.issue_resolution}
                    onChange={(val) => setRatings({ ...ratings, issue_resolution: val })}
                    label="Issue Resolution"
                  />
                  
                  <StarRating
                    value={ratings.wait_time_satisfaction}
                    onChange={(val) => setRatings({ ...ratings, wait_time_satisfaction: val })}
                    label="Wait Time Satisfaction"
                  />
                </div>

                {/* Would Recommend */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <label className="text-white font-medium block mb-3 flex items-center space-x-2">
                    <ThumbsUp className="h-4 w-4 text-warm-teal" />
                    <span>Would you recommend our service?</span>
                  </label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(true)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all duration-300 ${
                        wouldRecommend
                          ? 'border-warm-teal bg-warm-teal/20 text-warm-teal'
                          : 'border-white/20 bg-white/5 text-white/70 hover:border-warm-teal/50'
                      }`}
                    >
                      👍 Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setWouldRecommend(false)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all duration-300 ${
                        !wouldRecommend
                          ? 'border-warm-pink bg-warm-pink/20 text-warm-pink'
                          : 'border-white/20 bg-white/5 text-white/70 hover:border-warm-pink/50'
                      }`}
                    >
                      👎 No
                    </button>
                  </div>
                </div>

                {/* Comments */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <label className="text-white font-medium block mb-3 flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 text-warm-purple" />
                    <span>Additional Comments (Optional)</span>
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-warm-purple/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-warm-purple focus:ring-2 focus:ring-warm-purple/20 transition-all duration-300 resize-none"
                    placeholder="Tell us more about your experience..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-white/10 backdrop-blur-md text-white font-semibold py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-warm-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default FeedbackFormModal