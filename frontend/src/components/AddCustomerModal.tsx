import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, MessageCircle, Star, Phone, AlertCircle, Plus } from 'lucide-react'

interface AddCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (customerData: any) => void
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = React.useState({
    name: '',
    sentiment: 'neutral',
    tier: 'standard',
    issue_type: 'technical_support',
    channel: 'phone',
    priority: 5,
    issue_complexity: 3
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Customer name is required'
    }

    if (formData.priority < 1 || formData.priority > 10) {
      newErrors.priority = 'Priority must be between 1 and 10'
    }

    if (formData.issue_complexity < 1 || formData.issue_complexity > 5) {
      newErrors.issue_complexity = 'Issue complexity must be between 1 and 5'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      console.log('🚀 Submitting customer data:', formData)
      await onSubmit(formData)
      
      // Reset form
      setFormData({
        name: '',
        sentiment: 'neutral',
        tier: 'standard',
        issue_type: 'technical_support',
        channel: 'phone',
        priority: 5,
        issue_complexity: 3
      })
      
      onClose()
    } catch (error) {
      console.error('❌ Error adding customer:', error)
      // Don't close modal on error so user can retry
    } finally {
      setIsSubmitting(false)
    }
  }

  const sentimentOptions = [
    { value: 'positive', label: 'Positive', icon: '😊', color: 'text-sentiment-positive' },
    { value: 'neutral', label: 'Neutral', icon: '😐', color: 'text-sentiment-neutral' },
    { value: 'negative', label: 'Negative', icon: '😤', color: 'text-sentiment-negative' }
  ]

  const tierOptions = [
    { value: 'basic', label: 'Basic', icon: '🥉', color: 'text-tier-basic' },
    { value: 'standard', label: 'Standard', icon: '🥈', color: 'text-tier-standard' },
    { value: 'premium', label: 'Premium', icon: '🥇', color: 'text-tier-premium' }
  ]

  const issueTypeOptions = [
    { value: 'technical_support', label: 'Technical Support', icon: '🔧' },
    { value: 'billing', label: 'Billing', icon: '💳' },
    { value: 'account_management', label: 'Account Management', icon: '👤' },
    { value: 'sales', label: 'Sales', icon: '💼' },
    { value: 'product_inquiry', label: 'Product Inquiry', icon: '❓' },
    { value: 'complaint_resolution', label: 'Complaint Resolution', icon: '⚠️' }
  ]

  const channelOptions = [
    { value: 'phone', label: 'Phone', icon: '📞' },
    { value: 'chat', label: 'Chat', icon: '💬' },
    { value: 'email', label: 'Email', icon: '📧' }
  ]

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
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Add New Customer</h2>
                    <p className="text-white/80">Add a customer to the routing queue</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {/* Customer Name */}
                <div>
                  <label className="text-white font-medium block mb-2 flex items-center space-x-2">
                    <User className="h-4 w-4 text-warm-orange" />
                    <span>Customer Name</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-warm-orange/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20 transition-all duration-300"
                    placeholder="Enter customer name"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Sentiment */}
                <div>
                  <label className="text-white font-medium block mb-3 flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-warm-teal" />
                    <span>Customer Sentiment</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {sentimentOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('sentiment', option.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          formData.sentiment === option.value
                            ? 'border-warm-teal bg-warm-teal/20 text-warm-teal'
                            : 'border-white/20 bg-white/5 text-white/70 hover:border-warm-teal/50 hover:bg-warm-teal/10'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier */}
                <div>
                  <label className="text-white font-medium block mb-3 flex items-center space-x-2">
                    <Star className="h-4 w-4 text-warm-pink" />
                    <span>Customer Tier</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {tierOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('tier', option.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          formData.tier === option.value
                            ? 'border-warm-pink bg-warm-pink/20 text-warm-pink'
                            : 'border-white/20 bg-white/5 text-white/70 hover:border-warm-pink/50 hover:bg-warm-pink/10'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Issue Type */}
                <div>
                  <label className="text-white font-medium block mb-2">Issue Type</label>
                  <select
                    value={formData.issue_type}
                    onChange={(e) => handleInputChange('issue_type', e.target.value)}
                    className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-warm-purple/30 rounded-xl px-4 py-3 text-white focus:border-warm-purple focus:ring-2 focus:ring-warm-purple/20 transition-all duration-300"
                  >
                    {issueTypeOptions.map((option) => (
                      <option key={option.value} value={option.value} className="bg-slate-800 text-white">
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Channel */}
                <div>
                  <label className="text-white font-medium block mb-3 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-warm-blue" />
                    <span>Contact Channel</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {channelOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleInputChange('channel', option.value)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          formData.channel === option.value
                            ? 'border-warm-blue bg-warm-blue/20 text-warm-blue'
                            : 'border-white/20 bg-white/5 text-white/70 hover:border-warm-blue/50 hover:bg-warm-blue/10'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority and Complexity */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-white font-medium block mb-2">Priority (1-10)</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer slider accent-warm-orange"
                        style={{
                          background: `linear-gradient(to right, #ff7849 0%, #ff7849 ${(formData.priority - 1) / 9 * 100}%, #374151 ${(formData.priority - 1) / 9 * 100}%, #374151 100%)`
                        }}
                      />
                      <span className="text-warm-orange font-bold min-w-[30px] text-center">
                        {formData.priority}
                      </span>
                    </div>
                    {errors.priority && (
                      <p className="text-red-400 text-sm mt-1">{errors.priority}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-white font-medium block mb-2">Issue Complexity (1-5)</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.issue_complexity}
                        onChange={(e) => handleInputChange('issue_complexity', parseInt(e.target.value))}
                        className="flex-1 h-2 bg-slate-700/50 rounded-lg appearance-none cursor-pointer slider accent-warm-teal"
                        style={{
                          background: `linear-gradient(to right, #3dc1d3 0%, #3dc1d3 ${(formData.issue_complexity - 1) / 4 * 100}%, #374151 ${(formData.issue_complexity - 1) / 4 * 100}%, #374151 100%)`
                        }}
                      />
                      <span className="text-warm-teal font-bold min-w-[30px] text-center">
                        {formData.issue_complexity}
                      </span>
                    </div>
                    {errors.issue_complexity && (
                      <p className="text-red-400 text-sm mt-1">{errors.issue_complexity}</p>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 bg-white/10 backdrop-blur-md text-white font-semibold py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-warm-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add Customer</span>
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

export default AddCustomerModal