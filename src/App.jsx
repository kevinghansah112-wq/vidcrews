import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Nav from './components/Nav'
import Footer from './components/Footer'
import LocationGate from './pages/LocationGate'
import AuthPage from './pages/AuthPage'
import Browse from './pages/Browse'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import Jobs from './pages/Jobs'
import AdminPanel from './pages/AdminPanel'
import Chatbot from './pages/Chatbot'
import './styles.css'
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
function AppInner() {
  var auth = useAuth()
  var profile = auth.profile
  var loading = auth.loading
  var screenState = useState('location')
  var setScreen = screenState[1]
  var screen = screenState[0]
  var historyState = useState([])
  var setHistory = historyState[1]
  var history = historyState[0]
  var locationState = useState({ country: 'Ghana', city: 'Accra' })
  var setLocation = locationState[1]
  var location = locationState[0]
  useEffect(function() {
    var theme = getSystemTheme()
    document.documentElement.setAttribute('data-theme', theme)
  }, [])
  function go(sc) {
    setHistory(function(h) { return [...h, screen] })
    setScreen(sc)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function goBack() {
    if (history.length > 0) {
      var prev = history[history.length - 1]
      setHistory(function(h) { return h.slice(0, -1) })
      setScreen(prev)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  useEffect(function() {
    if (!loading && profile && (screen === 'location' || screen === 'auth')) {
      go('browse')
    }
  }, [profile, loading])
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
        <div className="spinner" />
      </div>
    )
  }
  var showBack = history.length > 0 && screen !== 'browse' && screen !== 'location'
  return (
    <div className="app">
      <Nav go={go} />
      <main>
        {showBack && (
          <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'var(--text-2)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, padding: 0 }}>
            Back
          </button>
        )}
        {screen === 'location' && <LocationGate location={location} setLocation={setLocation} go={go} />}
        {screen === 'auth' && <AuthPage go={go} />}
        {screen === 'browse' && <Browse location={location} go={go} />}
        {screen === 'dashboard' && <Dashboard go={go} />}
        {screen === 'profile' && <Profile go={go} />}
        {screen === 'messages' && <Messages go={go} />}
        {screen === 'jobs' && <Jobs go={go} />}
        {screen === 'chat' && <Chatbot go={go} />}
        {screen === 'admin' && profile && profile.is_admin && <AdminPanel go={go} />}
      </main>
      <Footer />
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