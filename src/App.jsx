import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Nav from './components/Nav'
import LocationGate from './pages/LocationGate'
import AuthPage from './pages/AuthPage'
import Browse from './pages/Browse'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Chatbot from './pages/Chatbot'
import AdminPanel from './pages/AdminPanel'
import './styles.css'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function AppInner() {
  const { profile, loading } = useAuth()
  const [screen, setScreen] = useState('location')
  const [location, setLocation] = useState({ country: 'Ghana', city: 'Accra' })
  const [theme, setTheme] = useState(() => localStorage.getItem('vc-theme') || getSystemTheme())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('vc-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const go = (sc) => {
    setScreen(sc)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Auto-redirect logged-in users from location/auth to browse
  useEffect(() => {
    if (!loading && profile && (screen === 'location' || screen === 'auth')) {
      go('browse')
    }
  }, [profile, loading])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="app">
      <Nav go={go} theme={theme} toggleTheme={toggleTheme} />
      <main>
        {screen === 'location' && <LocationGate location={location} setLocation={setLocation} go={go} />}
        {screen === 'auth'     && <AuthPage go={go} />}
        {screen === 'browse'   && <Browse location={location} go={go} />}
        {screen === 'dashboard'&& <Dashboard go={go} />}
        {screen === 'profile'  && <Profile go={go} />}
        {screen === 'messages' && <Messages go={go} />}
        {screen === 'chat'     && <Chatbot go={go} />}
        {screen === 'admin'    && profile?.is_admin && <AdminPanel go={go} />}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
