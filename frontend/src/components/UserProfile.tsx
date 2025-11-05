import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Settings, 
  LogOut, 
  Edit3, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Shield,
  Bell,
  Palette,
  Database,
  Key,
  X
} from 'lucide-react'

interface UserProfileProps {
  isOpen: boolean
  onClose: () => void
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  // Mock user data for now - this will be replaced with actual user context
  const user = {
    firstName: 'Admin',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'admin@sqrs.com' }],
    imageUrl: null
  }
  const [activeTab, setActiveTab] = React.useState('profile')

  const handleSignOut = () => {
    // This will be handled by the parent component
    onClose()
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
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

          {/* Profile Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-warm-gradient p-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center">
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-3xl object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {user?.fullName || 'User Profile'}
                    </h2>
                    <p className="text-white/80">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </span>
                      <span className="text-white/60 text-sm">
                        Admin User
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex h-[600px]">
                {/* Sidebar */}
                <div className="w-64 bg-slate-800/50 p-6 border-r border-white/10">
                  <nav className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                            activeTab === tab.id
                              ? 'bg-warm-gradient text-white shadow-lg'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      )
                    })}
                    
                    <div className="pt-4 border-t border-white/10 mt-6">
                      <button
                        onClick={() => openUserProfile()}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300"
                      >
                        <Edit3 className="h-5 w-5" />
                        <span className="font-medium">Edit Profile</span>
                      </button>
                      
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-red-300 hover:bg-red-500/20 transition-all duration-300"
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Sign Out</span>
                      </button>
                    </div>
                  </nav>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {activeTab === 'profile' && <ProfileTab user={user} />}
                  {activeTab === 'settings' && <SettingsTab />}
                  {activeTab === 'security' && <SecurityTab />}
                  {activeTab === 'notifications' && <NotificationsTab />}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const ProfileTab = ({ user }: { user: any }) => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-white mb-6">Profile Information</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Mail className="h-5 w-5 text-warm-orange" />
          <span className="text-white font-medium">Email</span>
        </div>
        <p className="text-white/80">{user?.primaryEmailAddress?.emailAddress || 'Not provided'}</p>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Phone className="h-5 w-5 text-warm-teal" />
          <span className="text-white font-medium">Phone</span>
        </div>
        <p className="text-white/80">{user?.primaryPhoneNumber?.phoneNumber || 'Not provided'}</p>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Calendar className="h-5 w-5 text-warm-pink" />
          <span className="text-white font-medium">Member Since</span>
        </div>
        <p className="text-white/80">
          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
        </p>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <MapPin className="h-5 w-5 text-warm-purple" />
          <span className="text-white font-medium">Location</span>
        </div>
        <p className="text-white/80">San Francisco, CA</p>
      </div>
    </div>
    
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <h4 className="text-lg font-semibold text-white mb-4">Activity Summary</h4>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-warm-orange mb-1">1,247</div>
          <div className="text-white/60 text-sm">Total Routings</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warm-teal mb-1">94%</div>
          <div className="text-white/60 text-sm">Success Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-warm-pink mb-1">42</div>
          <div className="text-white/60 text-sm">Days Active</div>
        </div>
      </div>
    </div>
  </div>
)

const SettingsTab = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-white mb-6">Application Settings</h3>
    
    <div className="space-y-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Palette className="h-5 w-5 text-warm-orange" />
            <div>
              <h4 className="text-white font-medium">Theme</h4>
              <p className="text-white/60 text-sm">Choose your preferred color scheme</p>
            </div>
          </div>
          <select className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-white">
            <option value="warm">Warm Gradient</option>
            <option value="cool">Cool Tones</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-5 w-5 text-warm-teal" />
            <div>
              <h4 className="text-white font-medium">Auto-refresh Dashboard</h4>
              <p className="text-white/60 text-sm">Automatically update data every 30 seconds</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warm-gradient"></div>
          </label>
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-warm-pink" />
            <div>
              <h4 className="text-white font-medium">Sound Notifications</h4>
              <p className="text-white/60 text-sm">Play sounds for routing alerts</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warm-gradient"></div>
          </label>
        </div>
      </div>
    </div>
  </div>
)

const SecurityTab = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-white mb-6">Security & Privacy</h3>
    
    <div className="space-y-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="h-5 w-5 text-warm-orange" />
          <h4 className="text-white font-medium">Two-Factor Authentication</h4>
        </div>
        <p className="text-white/60 text-sm mb-4">Add an extra layer of security to your account</p>
        <button className="bg-warm-gradient text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity">
          Enable 2FA
        </button>
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-5 w-5 text-warm-teal" />
          <h4 className="text-white font-medium">Active Sessions</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">Current Session</p>
              <p className="text-white/60 text-sm">Windows • Chrome • San Francisco, CA</p>
            </div>
            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">Active</span>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const NotificationsTab = () => (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-white mb-6">Notification Preferences</h3>
    
    <div className="space-y-4">
      {[
        { title: 'Routing Alerts', desc: 'Get notified when new routing assignments are made', enabled: true },
        { title: 'System Updates', desc: 'Receive notifications about system maintenance', enabled: true },
        { title: 'Performance Reports', desc: 'Weekly performance summary emails', enabled: false },
        { title: 'Agent Status Changes', desc: 'Notifications when agents go online/offline', enabled: true },
      ].map((item, index) => (
        <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">{item.title}</h4>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={item.enabled} />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warm-gradient"></div>
            </label>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default UserProfile