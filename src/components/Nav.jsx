import { useAuth } from '../hooks/useAuth'
import { signOut } from '../lib/supabase'

export default function Nav({ go, theme, toggleTheme }) {
  const { profile } = useAuth()
  const isCreative = profile?.user_type === 'creative'
  const isAdmin = profile?.is_admin

  const handleSignOut = async () => {
    await signOut()
    go('location')
  }

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => go(profile ? 'browse' : 'location')}>
        VidCrews <span>/ Africa</span>
      </div>

      <div className="nav-links">
        <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {profile ? (
          <>
            <button className="btn-g" onClick={() => go('browse')}>Browse</button>
            {isCreative && <button className="btn-g" onClick={() => go('dashboard')}>Earnings</button>}
            <button className="btn-g" onClick={() => go('messages')}>Messages</button>
            <button className="btn-g" onClick={() => go('chat')}>AI Chat</button>
            {isAdmin && (
              <button className="btn btn-sm" onClick={() => go('admin')} style={{ marginLeft: 4 }}>Admin</button>
            )}
            <button className="btn-g" onClick={handleSignOut}>Log out</button>
            <div
              className="av"
              style={{ width: 34, height: 34, fontSize: 11, marginLeft: 4, cursor: 'pointer' }}
              onClick={() => go('profile')}
              title={profile.username}
            >
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.username} />
                : profile.initials}
            </div>
          </>
        ) : (
          <>
            <button className="btn-g" onClick={() => go('auth')}>Log in</button>
            <button className="btn btn-sm" onClick={() => go('auth')}>Sign up</button>
          </>
        )}
      </div>
    </nav>
  )
}