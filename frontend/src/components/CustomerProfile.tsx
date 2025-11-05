import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit3, 
  Save, 
  X,
  Star,
  Clock,
  MessageCircle,
  BarChart3,
  Settings,
  Bell,
  Eye,
  EyeOff
} from 'lucide-react'

interface CustomerProfileProps {
  isOpen: boolean
  onClose: () => void
  user: any
  customerStats: any
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ isOpen, onClose, user, customerStats }) => {
  const [activeTab, setActiveTab] = React.useState('profile')
  const [isEditing, setIsEditing] = React.useState(false)
  const [profileData, setProfileData] = React.useState({
    name: user?.name || 'Customer User',
    email: user?.email || 'customer@example.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: '2024-01-01',
    tier: 'Standard',
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsAlerts: false,
      preferredChannel: 'phone'
    }
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to backend
    console.log('Saving profile data:', profileData)
  }

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePreferenceChange = (pref: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [pref]: value
      }
    }))
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-md rounded-3xl border border-white/20 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Customer Profile</h2>
                  <p className="text-white/70">Manage your account and preferences</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="p-2 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors"
                  >
                    <Edit3 className="h-5 w-5" />
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 text-white/70 rounded-xl hover:bg-white/20 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-full">
              {/* Sidebar */}
              <div className="w-64 p-6 border-r border-white/20">
                <nav className="space-y-2">
                  {[
                    { id: 'profile', label: 'Profile Info', icon: User },
                    { id: 'stats', label: 'My Statistics', icon: BarChart3 },
                    { id: 'preferences', label: 'Preferences', icon: Settings },
                    { id: 'security', label: 'Security', icon: Shield }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-300 border border-green-500/30'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-6">Profile Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-white/70 text-sm font-medium block mb-2">Full Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                          />
                        ) : (
                          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white">
                            {profileData.name}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-white/70 text-sm font-medium block mb-2">Email Address</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={profileData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                          />
                        ) : (
                          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-white/50" />
                            <span>{profileData.email}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-white/70 text-sm font-medium block mb-2">Phone Number</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                          />
                        ) : (
                          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-white/50" />
                            <span>{profileData.phone}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-white/70 text-sm font-medium block mb-2">Location</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                          />
                        ) : (
                          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-white/50" />
                            <span>{profileData.location}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-white/70 text-sm font-medium block mb-2">Customer Since</label>
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-white/50" />
                          <span>{new Date(profileData.joinDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-white/70 text-sm font-medium block mb-2">Customer Tier</label>
                        <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span>{profileData.tier}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-6">My Statistics</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <MessageCircle className="h-8 w-8 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{customerStats.totalQueries}</div>
                        <div className="text-blue-300 text-sm">Total Queries</div>
                      </div>

                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <MessageCircle className="h-8 w-8 text-green-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{customerStats.resolvedQueries}</div>
                        <div className="text-green-300 text-sm">Resolved</div>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <Star className="h-8 w-8 text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{customerStats.averageRating.toFixed(1)}</div>
                        <div className="text-yellow-300 text-sm">Avg Rating</div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-4">
                          <Clock className="h-8 w-8 text-purple-400" />
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{customerStats.totalWaitTime}m</div>
                        <div className="text-purple-300 text-sm">Total Wait Time</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'preferences' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-6">Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-4">Notification Settings</h4>
                        
                        <div className="space-y-4">
                          {[
                            { key: 'notifications', label: 'Push Notifications', icon: Bell },
                            { key: 'emailUpdates', label: 'Email Updates', icon: Mail },
                            { key: 'smsAlerts', label: 'SMS Alerts', icon: Phone }
                          ].map((pref) => (
                            <div key={pref.key} className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <pref.icon className="h-5 w-5 text-white/70" />
                                <span className="text-white">{pref.label}</span>
                              </div>
                              <button
                                onClick={() => handlePreferenceChange(pref.key, !profileData.preferences[pref.key as keyof typeof profileData.preferences])}
                                className={`relative w-12 h-6 rounded-full transition-colors ${
                                  profileData.preferences[pref.key as keyof typeof profileData.preferences]
                                    ? 'bg-green-500'
                                    : 'bg-gray-600'
                                }`}
                              >
                                <div
                                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                    profileData.preferences[pref.key as keyof typeof profileData.preferences]
                                      ? 'translate-x-7'
                                      : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-4">Preferred Communication Channel</h4>
                        
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'phone', label: 'Phone', icon: Phone },
                            { value: 'chat', label: 'Chat', icon: MessageCircle },
                            { value: 'email', label: 'Email', icon: Mail }
                          ].map((channel) => (
                            <button
                              key={channel.value}
                              onClick={() => handlePreferenceChange('preferredChannel', channel.value)}
                              className={`p-4 rounded-xl border transition-all ${
                                profileData.preferences.preferredChannel === channel.value
                                  ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                  : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <channel.icon className="h-6 w-6 mx-auto mb-2" />
                              <div className="text-sm font-medium">{channel.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-6">Security Settings</h3>
                    
                    <div className="space-y-4">
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-4">Password</h4>
                        <button className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-colors">
                          Change Password
                        </button>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-4">Two-Factor Authentication</h4>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Enable 2FA for enhanced security</span>
                          <button className="bg-green-500/20 text-green-300 px-4 py-2 rounded-xl hover:bg-green-500/30 transition-colors">
                            Enable
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <h4 className="text-white font-semibold mb-4">Privacy</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Profile Visibility</span>
                            <button className="flex items-center space-x-2 text-white/70">
                              <Eye className="h-4 w-4" />
                              <span>Public</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CustomerProfile