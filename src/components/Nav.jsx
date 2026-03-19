import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../lib/supabase'
export default function Nav({ go }) {
  var auth = useAuth()
  var profile = auth.profile
  var isCreative = profile && profile.user_type === 'creative'
  var isAdmin = profile && profile.is_admin
  var menuState = useState(false)
  var setMenuOpen = menuState[1]
  var menuOpen = menuState[0]
  function handleSignOut() {
    signOut().then(function() { go('location') })
  }
  function navClick(screen) {
    setMenuOpen(false)
    go(screen)
  }
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={function() { go(profile ? 'browse' : 'location') }}>
        VidCrews <span>/ Africa</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={function() { setMenuOpen(function(o) { return !o }) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', flexDirection: 'column', gap: '5px' }}
          aria-label="Menu"
        >
          <div style={{ width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <div style={{ width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'opacity 0.2s', opacity: menuOpen ? 0 : 1 }} />
          <div style={{ width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </div>
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 54,
          right: 0,
          width: '100%',
          maxWidth: 280,
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 200,
          padding: '8px 0'
        }}>
          {profile ? (
            <div>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.full_name || profile.username}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>@{profile.username}</div>
              </div>
              {[
                ['Browse Crew', 'browse'],
                ['Job Board', 'jobs'],
                ['Messages', 'messages'],
                isCreative ? ['Earnings', 'dashboard'] : null,
                ['My Profile', 'profile']
              ].filter(Boolean).map(function(item) {
                return (
                  <button key={item[1]} onClick={function() { navClick(item[1]) }}
                    style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '12px 20px', fontSize: 14, color: 'var(--text)', cursor: 'pointer', textAlign: 'left' }}
                    onMouseOver={function(e) { e.currentTarget.style.background = 'var(--surface-2)' }}
                    onMouseOut={function(e) { e.currentTarget.style.background = 'none' }}
                  >
                    {item[0]}
                  </button>
                )
              })}
              {isAdmin && (
                <button onClick={function() { navClick('admin') }}
                  style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '12px 20px', fontSize: 14, color: 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>
                  Admin Panel
                </button>
              )}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                <button onClick={function() { setMenuOpen(false); handleSignOut() }}
                  style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '12px 20px', fontSize: 14, color: 'var(--red)', cursor: 'pointer', textAlign: 'left' }}>
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div>
              {[['Browse Crew', 'browse'], ['Job Board', 'jobs']].map(function(item) {
                return (
                  <button key={item[1]} onClick={function() { navClick(item[1]) }}
                    style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '12px 20px', fontSize: 14, color: 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>
                    {item[0]}
                  </button>
                )
              })}
              <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                <button className="btn-s" style={{ flex: 1, padding: 9 }} onClick={function() { navClick('auth') }}>Log in</button>
                <button className="btn" style={{ flex: 1, padding: 9 }} onClick={function() { navClick('auth') }}>Sign up</button>
              </div>
            </div>
          )}
        </div>
      )}
      {menuOpen && (
        <div onClick={function() { setMenuOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 190 }} />
      )}
    </nav>
  )
}