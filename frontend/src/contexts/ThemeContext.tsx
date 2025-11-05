import * as React from 'react'

export type ThemeType = 'warm' | 'cool' | 'dark' | 'light' | 'system'

interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  effectiveTheme: 'warm' | 'cool' | 'dark' | 'light'
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = React.useState<ThemeType>(() => {
    // Load theme from localStorage or default to 'warm'
    const savedTheme = localStorage.getItem('app-theme') as ThemeType
    return savedTheme || 'warm'
  })

  const [systemTheme, setSystemTheme] = React.useState<'dark' | 'light'>('dark')

  // Detect system theme preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial value
    handleChange(mediaQuery)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Calculate effective theme
  const effectiveTheme = React.useMemo(() => {
    if (theme === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light'
    }
    return theme
  }, [theme, systemTheme])

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement
    
    // Remove all theme classes
    root.classList.remove('theme-warm', 'theme-cool', 'theme-dark', 'theme-light')
    
    // Add current theme class
    root.classList.add(`theme-${effectiveTheme}`)
    
    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    const themeColors = {
      warm: '#ff7849',
      cool: '#3b82f6',
      dark: '#0f172a',
      light: '#f8fafc'
    }
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColors[effectiveTheme])
    }
  }, [effectiveTheme])

  const setTheme = React.useCallback((newTheme: ThemeType) => {
    setThemeState(newTheme)
    localStorage.setItem('app-theme', newTheme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
