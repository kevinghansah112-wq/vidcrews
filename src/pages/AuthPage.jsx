import { useState } from 'react'
import { signUp, signIn, resetPassword } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import PasswordInput from '../components/PasswordInput'
import { AFRICAN_COUNTRIES, ROLES, EQUIPMENT, CURRENCIES } from '../lib/constants'

export default function AuthPage({ go }) {
  const { refreshProfile, session } = useAuth()
  const [mode, setMode] = useState('login') // login | signup | forgot
  const [step, setStep] = useState(1)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selEquip, setSelEquip] = useState([])
  const [country, setCountry] = useState('Ghana')

  const cities = AFRICAN_COUNTRIES.find(c => c.name === country)?.cities || []

  const [form, setForm] = useState({
    username: '', password: '', full_name: '',
    recovery_email: '', user_type: '',
    role: 'Videographer', city: 'Accra', country: 'Ghana',
    day_rate: '', currency: 'GHS', bio: ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleEquip = e => setSelEquip(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await signIn({ username: form.username, password: form.password })
      await new Promise(r => setTimeout(r, 800))
      await refreshProfile()
      go('browse')
    } catch {
      setError('Incorrect username or password')
    } finally { setLoading(false) }
  }

  const handleSignup = async () => {
    setLoading(true); setError(null)
    try {
      await signUp({
        username: form.username,
        password: form.password,
        full_name: form.full_name,
        user_type: form.user_type,
        role: form.user_type === 'creative' ? form.role : null,
        city: form.city,
        country: form.country,
        currency: form.currency,
        recovery_email: form.recovery_email,
      })
      await new Promise(r => setTimeout(r, 1500))
      await refreshProfile()
      go('browse')
    } catch (err) {
      setError(err.message?.includes('already') ? 'Username taken. Try another.' : err.message)
    } finally { setLoading(false) }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await resetPassword(form.recovery_email)
      setSuccess('Reset link sent! Check your email.')
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  // ── FORGOT ────────────────────────────────────────────────
  if (mode === 'forgot') return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 8px' }}>
      <h2 style={{ fontSize: 20, marginBottom: 4 }}>Reset Password</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>Enter the recovery email you added when signing up.</p>
      {success ? (
        <div className="ok-box">{success}</div>
      ) : (
        <form className="col" onSubmit={handleForgot}>
          <div>
            <div className="lbl">Recovery Email</div>
            <input className="inp" type="email" value={form.recovery_email} onChange={e => set('recovery_email', e.target.value)} placeholder="The email you added to your account" />
          </div>
          {error && <div className="err-box">{error}</div>}
          <button className="btn" type="submit" disabled={loading} style={{ padding: 10, width: '100%' }}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text-3)' }}>
        <span onClick={() => setMode('login')} style={{ color: 'var(--text)', cursor: 'pointer', textDecoration: 'underline' }}>Back to login</span>
      </div>
    </div>
  )

  // ── LOGIN ─────────────────────────────────────────────────
  if (mode === 'login') return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: '0 8px' }}>
      <h2 style={{ fontSize: 20, marginBottom: 4 }}>Welcome back</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>Log in to VidCrews</p>
      <form className="col" onSubmit={handleLogin}>
        <div>
          <div className="lbl">Username</div>
          <input className="inp" value={form.username} onChange={e => set('username', e.target.value.toLowerCase())} placeholder="your_username" autoCapitalize="none" autoCorrect="off" />
        </div>
        <div>
          <div className="lbl">Password</div>
          <PasswordInput value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
        {error && <div className="err-box">{error}</div>}
        <button className="btn" type="submit" disabled={loading} style={{ padding: 10, width: '100%' }}>
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
          <span onClick={() => setMode('forgot')} style={{ color: 'var(--text)', cursor: 'pointer', textDecoration: 'underline' }}>Forgot password?</span>
          <span onClick={() => { setMode('signup'); setStep(0) }} style={{ color: 'var(--text)', cursor: 'pointer', textDecoration: 'underline' }}>Sign up free</span>
        </div>
      </form>
    </div>
  )

  // ── SIGNUP ────────────────────────────────────────────────

  // Step 0: choose user type
  if (step === 0) return (
    <div style={{ maxWidth: 500, margin: '60px auto', padding: '0 8px' }}>
      <h2 style={{ fontSize: 22, marginBottom: 6 }}>Join VidCrews</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 32 }}>What brings you here?</p>
      <div className="g2">
        {[
          { type: 'creative', icon: '🎬', title: "I'm a Creative", desc: "I offer videography, photography, editing or other creative services." },
          { type: 'client',   icon: '🎯', title: "I Need to Hire", desc: "I'm looking for creative professionals for my project or production." }
        ].map(o => (
          <div key={o.type} className="card card-hover"
            onClick={() => { set('user_type', o.type); setStep(1) }}
            style={{ cursor: 'pointer', textAlign: 'center', padding: 28 }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>{o.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{o.title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{o.desc}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-3)' }}>
        Already have an account?{' '}
        <span onClick={() => setMode('login')} style={{ color: 'var(--text)', cursor: 'pointer', textDecoration: 'underline' }}>Log in</span>
      </div>
    </div>
  )

  // Step 1: account details
  if (step === 1) return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 8px' }}>
      <div className="pg">Step 1 of {form.user_type === 'creative' ? 3 : 2} - Account</div>
      <h2 style={{ fontSize: 20, marginBottom: 4 }}>Create your account</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>Pick a username and password.</p>
      <div className="col">
        <div>
          <div className="lbl">Full Name</div>
          <input className="inp" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Your full name" />
        </div>
        <div>
          <div className="lbl">Username</div>
          <input className="inp" value={form.username} onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="e.g. kwamefilms" autoCapitalize="none" autoCorrect="off" />
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Letters, numbers and underscores only. This is how you log in.</div>
        </div>
        <div>
          <div className="lbl">Password</div>
          <PasswordInput value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
        <div>
          <div className="lbl">Recovery Email <span style={{ color: 'var(--text-3)', fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
          <input className="inp" type="email" value={form.recovery_email} onChange={e => set('recovery_email', e.target.value)} placeholder="In case you forget your password" />
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>We'll send a reset link here if you forget your password.</div>
        </div>
        {error && <div className="err-box">{error}</div>}
        <button className="btn" onClick={() => {
          if (!form.username || !form.password) { setError('Username and password are required'); return }
          if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
          setError(null); setStep(2)
        }} style={{ padding: 10, width: '100%' }}>Continue</button>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
          <span onClick={() => setStep(0)} style={{ color: 'var(--text)', cursor: 'pointer', textDecoration: 'underline' }}>← Back</span>
        </div>
      </div>
    </div>
  )

  // Step 2: location + role (for creatives) or location only (for clients)
  if (step === 2) return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 8px' }}>
      <div className="pg">Step 2 of {form.user_type === 'creative' ? 3 : 2} - {form.user_type === 'creative' ? 'Your Profile' : 'Location'}</div>
      <h2 style={{ fontSize: 20, marginBottom: 4 }}>{form.user_type === 'creative' ? 'Tell us about yourself' : 'Where are you based?'}</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>
        {form.user_type === 'creative' ? 'This is how clients discover you.' : 'This helps us show you nearby creatives.'}
      </p>
      <div className="col">
        {form.user_type === 'creative' && (
          <>
            <div>
              <div className="lbl">Your Role</div>
              <select className="fsel" value={form.role} onChange={e => set('role', e.target.value)}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <div className="lbl">Day Rate</div>
              <div className="row">
                <select className="fsel" style={{ width: 100, flexShrink: 0 }} value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                </select>
                <input className="inp" type="number" min="0" value={form.day_rate} onChange={e => set('day_rate', e.target.value)} placeholder="e.g. 900" />
              </div>
            </div>
            <div>
              <div className="lbl">Short Bio</div>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Your experience, notable work..." />
            </div>
          </>
        )}
        <div>
          <div className="lbl">Country</div>
          <select className="fsel" value={country} onChange={e => { setCountry(e.target.value); set('country', e.target.value) }}>
            {AFRICAN_COUNTRIES.map(c => <option key={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <div className="lbl">City</div>
          <select className="fsel" value={form.city} onChange={e => set('city', e.target.value)}>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn-s" onClick={() => setStep(1)} style={{ flex: 1, padding: 9 }}>Back</button>
          <button className="btn" onClick={() => {
            if (form.user_type === 'client') handleSignup()
            else setStep(3)
          }} style={{ flex: 2, padding: 10 }}>
            {form.user_type === 'client' ? (loading ? 'Creating...' : 'Create Account') : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )

  // Step 3: equipment (creatives only)
  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: '0 8px' }}>
      <div className="pg">Step 3 of 3 - Equipment</div>
      <h2 style={{ fontSize: 20, marginBottom: 4 }}>What gear do you have?</h2>
      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24 }}>Let clients know what you bring to the shoot.</p>
      <div className="col">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {EQUIPMENT.map(e => (
            <button key={e} className={`pill ${selEquip.includes(e) ? 'on' : ''}`} onClick={() => toggleEquip(e)}>{e}</button>
          ))}
        </div>
        <div>
          <div className="lbl">Other gear <span style={{ color: 'var(--text-3)', fontSize: 10, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></div>
          <input className="inp" placeholder="Anything not listed above" />
        </div>
        {error && <div className="err-box">{error}</div>}
        <div className="row" style={{ gap: 8 }}>
          <button className="btn-s" onClick={() => setStep(2)} style={{ flex: 1, padding: 9 }}>Back</button>
          <button className="btn" onClick={handleSignup} disabled={loading} style={{ flex: 2, padding: 10 }}>
            {loading ? 'Creating account...' : 'Create Profile 🎬'}
          </button>
        </div>
      </div>
    </div>
  )
}
