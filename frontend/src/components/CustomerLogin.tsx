import * as React from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Lock, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react'

interface CustomerLoginProps {
  onLogin: (user: any, token: string) => void
  onSwitchToAdmin: () => void
  onBack?: () => void
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ onLogin, onSwitchToAdmin, onBack }) => {
  const [isSignup, setIsSignup] = React.useState(false)
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    name: ''
  })
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login'
      const body = isSignup 
        ? { ...formData, role: 'customer' }
        : { email: formData.email, password: formData.password }

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.user, data.token)
      } else {
        setError(data.error || 'Authentication failed')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Back Button */}
        {onBack && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="mb-8 flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Role Selection</span>
          </motion.button>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Customer Portal</h1>
          <p className="text-white/70">
            {isSignup ? 'Create your account' : 'Sign in to submit queries'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div>
                <label className="text-white font-medium block mb-2">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-blue-400/30 rounded-xl px-4 py-3 text-white placeholder-white/50"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-white font-medium block mb-2 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-blue-400/30 rounded-xl px-4 py-3 text-white placeholder-white/50"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="text-white font-medium block mb-2 flex items-center space-x-2">
                <Lock className="h-4 w-4 text-cyan-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-cyan-400/30 rounded-xl px-4 py-3 text-white placeholder-white/50"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-300" />
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
              }}
              className="text-blue-400 hover:text-cyan-400 transition-colors"
            >
              {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <button
              onClick={onSwitchToAdmin}
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              Admin? Click here →
            </button>
          </div>
        </div>
      </motion.div>
      </div>
    </div>
  )
}

export default CustomerLogin
