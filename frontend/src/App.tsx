import * as React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import LandingPage from './components/LandingPage'
import RoleSelection from './components/RoleSelection'
import AdminLogin from './components/AdminLogin'
import CustomerLogin from './components/CustomerLogin'
import SmartQueueDashboard from './components/SmartQueueDashboard'
import CustomerDashboard from './components/CustomerDashboard'

type AppState = 'landing' | 'role-selection' | 'admin-login' | 'customer-login' | 'authenticated'

function App() {
  const [user, setUser] = React.useState<any>(null)
  const [token, setToken] = React.useState<string>('')
  const [appState, setAppState] = React.useState<AppState>('landing')
  const [loading, setLoading] = React.useState(true)

  // Check for existing session on app load
  React.useEffect(() => {
    const savedToken = localStorage.getItem('auth-token')
    const savedUser = localStorage.getItem('user-data')
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
        setAppState('authenticated')
      } catch (error) {
        console.error('Error loading saved session:', error)
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user-data')
        setAppState('landing')
      }
    } else {
      setAppState('landing')
    }
    
    setLoading(false)
  }, [])

  const handleLogin = (userData: any, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    setAppState('authenticated')
    localStorage.setItem('auth-token', authToken)
    localStorage.setItem('user-data', JSON.stringify(userData))
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setToken('')
      setAppState('landing')
      localStorage.removeItem('auth-token')
      localStorage.removeItem('user-data')
    }
  }

  const handleGetStarted = () => {
    setAppState('role-selection')
  }

  const handleRoleSelection = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setAppState('admin-login')
    } else {
      setAppState('customer-login')
    }
  }

  const handleBackToLanding = () => {
    setAppState('landing')
  }

  const handleBackToRoleSelection = () => {
    setAppState('role-selection')
  }

  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Render based on app state
  const renderCurrentView = () => {
    switch (appState) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />
      
      case 'role-selection':
        return (
          <RoleSelection 
            onSelectRole={handleRoleSelection}
            onBack={handleBackToLanding}
          />
        )
      
      case 'admin-login':
        return (
          <AdminLogin 
            onLogin={handleLogin}
            onSwitchToCustomer={() => setAppState('customer-login')}
            onBack={handleBackToRoleSelection}
          />
        )
      
      case 'customer-login':
        return (
          <CustomerLogin 
            onLogin={handleLogin}
            onSwitchToAdmin={() => setAppState('admin-login')}
            onBack={handleBackToRoleSelection}
          />
        )
      
      case 'authenticated':
        if (user?.role === 'admin') {
          return <SmartQueueDashboard onLogout={handleLogout} />
        } else {
          return <CustomerDashboard user={user} onLogout={handleLogout} />
        }
      
      default:
        return <LandingPage onGetStarted={handleGetStarted} />
    }
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen">
        {renderCurrentView()}
      </div>
    </ThemeProvider>
  )
}

export default App