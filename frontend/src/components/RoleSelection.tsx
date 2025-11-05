import * as React from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, ArrowLeft } from 'lucide-react'

interface RoleSelectionProps {
  onSelectRole: (role: 'admin' | 'customer') => void
  onBack: () => void
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onBack}
          className="mb-8 flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Role
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Select how you'd like to access the Smart Queue Routing System
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Admin Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectRole('admin')}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Administrator</h2>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Access the full dashboard with customer queue management, agent pool oversight, 
                routing operations, and comprehensive analytics.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Customer Queue Management</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Agent Pool Oversight</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span>Performance Analytics</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span>System Configuration</span>
                </div>
              </div>
              
              <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform group-hover:scale-105">
                Continue as Admin
              </button>
            </div>
          </motion.div>

          {/* Customer Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectRole('customer')}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 cursor-pointer hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">Customer</h2>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                Submit support queries, view available agents, track your queue position, 
                and get real-time updates on your request status.
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Submit Support Queries</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span>View Available Agents</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Track Queue Position</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-white/70">
                  <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                  <span>Real-time Status Updates</span>
                </div>
              </div>
              
              <button className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform group-hover:scale-105">
                Continue as Customer
              </button>
            </div>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-white/60 text-sm">
            Don't have an account? You can sign up after selecting your role.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default RoleSelection