import * as React from 'react'
import { motion } from 'framer-motion'
import { Shield, Mail, Lock, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react'

interface AdminLoginProps {
  onLogin: (user: any, token: string) => void
  onSwitchToCustomer: () => void
  onBack?: () => void
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onSwitchToCustomer, onBack }) => {
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
        ? { ...formData, role: 'admin' }
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

  // Pre-fill admin credentials for demo
  React.useEffect(() => {
    if (!isSignup) {
      setFormData({
        email: 'admin@sqrs.com',
        password: 'admin123',
        name: ''
      })
    }
  }, [isSignup])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
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
          <div className="w-20 h-20 bg-warm-gradient rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-white/70">
            {isSignup ? 'Create admin account' : 'Sign in to manage the system'}
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
                  className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-warm-orange/30 rounded-xl px-4 py-3 text-white placeholder-white/50"
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-white font-medium block mb-2 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-warm-orange" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-warm-orange/30 rounded-xl px-4 py-3 text-white placeholder-white/50"
                placeholder="admin@sqrs.com"
                required
              />
            </div>

            <div>
              <label className="text-white font-medium block mb-2 flex items-center space-x-2">
                <Lock className="h-4 w-4 text-warm-teal" />
                <span>Password</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-warm-teal/30 rounded-xl px-4 py-3 text-white placeholder-white/50"
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
              className="w-full bg-warm-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center space-x-2"
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
              className="text-warm-orange hover:text-warm-pink transition-colors"
            >
              {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <button
              onClick={onSwitchToCustomer}
              className="text-white/70 hover:text-white transition-colors text-sm"
            >
              Customer? Click here →
            </button>
          </div>

          {!isSignup && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-blue-300 text-xs text-center">
                Demo credentials pre-filled. Click "Sign In" to continue.
              </p>
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </div>
  )
}

export default AdminLogin
