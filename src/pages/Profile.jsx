import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { updateProfile, uploadAvatar, getEquipment, setEquipment } from '../lib/supabase'
import { AFRICAN_COUNTRIES, ROLES, EQUIPMENT, CURRENCIES } from '../lib/constants'

export default function Profile({ go }) {
  const { profile, refreshProfile } = useAuth()
  const [equip, setEquip] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [country, setCountry] = useState('Ghana')
  const fileRef = useRef()

  const [form, setForm] = useState({
    full_name: '', bio: '', role: '', city: '', country: 'Ghana',
    day_rate: '', currency: 'GHS', availability: 'available', calendly_url: '',
    recovery_email: ''
  })

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        role: profile.role || 'Videographer',
        city: profile.city || '',
        country: profile.country || 'Ghana',
        day_rate: profile.day_rate || '',
        currency: profile.currency || 'GHS',
        availability: profile.availability || 'available',
        calendly_url: profile.calendly_url || '',
        recovery_email: profile.recovery_email || '',
      })
      setCountry(profile.country || 'Ghana')
      getEquipment(profile.id).then(setEquip)
    }
  }, [profile])

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>You need an account to edit your profile.</p>
      <button className="btn" onClick={() => go('auth')}>Sign up / Log in</button>
    </div>
  )

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleEquip = (e) => setEquip(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e])
  const cities = AFRICAN_COUNTRIES.find(c => c.name === country)?.cities || []
  const isCreative = profile.user_type === 'creative'

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadAvatar(profile.id, file)
      await updateProfile(profile.id, { avatar_url: url })
      await refreshProfile()
    } catch (err) { setError(err.message) }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      await updateProfile(profile.id, {
        full_name: form.full_name,
        bio: form.bio,
        role: form.role,
        city: form.city,
        country: form.country,
        day_rate: parseFloat(form.day_rate) || null,
        currency: form.currency,
        availability: form.availability,
        calendly_url: form.calendly_url || null,
        recovery_email: form.recovery_email || null,
      })
      if (isCreative) await setEquipment(profile.id, equip)
      await refreshProfile()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const isVerified = profile.full_name && profile.role && profile.bio && profile.city && profile.day_rate && profile.avatar_url
  const completeness = [profile.full_name, profile.role, profile.bio, profile.city, profile.day_rate, profile.avatar_url].filter(Boolean).length

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Your Profile</h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {isCreative ? 'What clients see when they find you' : 'Your account settings'}
        </p>
      </div>

      <div className="profile-layout">
        {/* Preview card */}
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Preview</div>
          <div className="card">
            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
              <div className="av" style={{ width: 72, height: 72, fontSize: 22, marginBottom: 10, position: 'relative' }}>
                {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.username} /> : profile.initials}
              </div>
              <button className="btn-s btn-sm" onClick={() => fileRef.current.click()} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>

            {/* Name + verified */}
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{form.full_name || profile.username}</span>
                {isVerified && <span className="verified-badge" title="Verified">✓</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>@{profile.username}</div>
              {isCreative && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{form.role}</div>}
            </div>

            {/* Verification progress */}
            {isCreative && !isVerified && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                  <span>Profile completion</span>
                  <span>{completeness}/6</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 4, height: 5 }}>
                  <div style={{ background: 'var(--yellow)', borderRadius: 4, height: 5, width: `${(completeness/6)*100}%`, transition: 'width .3s' }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
                  Complete all fields + add photo to earn your ✓ verified badge
                </div>
              </div>
            )}

            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>📍 {form.city}, {form.country}</div>
            {isCreative && form.day_rate && (
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                {CURRENCIES.find(c => c.code === form.currency)?.symbol}{form.day_rate}/day
              </div>
            )}
          </div>

          {/* Points */}
          {isCreative && (
            <div className="card" style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Points</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--yellow)' }}>⭐ {profile.points || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>+10 points per review</div>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="col">
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Basic Info</div>
            <div className="col">
              <div><div className="lbl">Full Name</div><input className="inp" value={form.full_name} onChange={e => set('full_name', e.target.value)} /></div>
              {isCreative && (
                <>
                  <div>
                    <div className="lbl">Role</div>
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
                      <input className="inp" type="number" value={form.day_rate} onChange={e => set('day_rate', e.target.value)} placeholder="e.g. 900" />
                    </div>
                  </div>
                  <div><div className="lbl">Bio</div><textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Your experience, notable work..." /></div>
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
              <div>
                <div className="lbl">Recovery Email</div>
                <input className="inp" type="email" value={form.recovery_email} onChange={e => set('recovery_email', e.target.value)} placeholder="For password reset" />
              </div>
            </div>
          </div>

          {isCreative && (
            <>
              <div className="card">
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Availability</div>
                {[['available','Available now'],['soon','Available soon'],['busy','Busy — not available']].map(([v,l]) => (
                  <label key={v} className="row" style={{ cursor: 'pointer', gap: 8, padding: '4px 0' }}>
                    <input type="radio" name="avail" value={v} checked={form.availability === v} onChange={() => set('availability', v)} />
                    <span style={{ fontSize: 13 }}>{l}</span>
                  </label>
                ))}
              </div>

              <div className="card">
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Calendly Link</div>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Add your Calendly link so clients can see your availability and book you directly.</p>
                <input className="inp" value={form.calendly_url} onChange={e => set('calendly_url', e.target.value)} placeholder="https://calendly.com/your-name" />
              </div>

              <div className="card">
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Equipment</div>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>Select all that apply</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {EQUIPMENT.map(e => (
                    <button key={e} className={`pill ${equip.includes(e) ? 'on' : ''}`} onClick={() => toggleEquip(e)}>{e}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <div className="err-box">{error}</div>}
          <button className="btn" onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', width: 'fit-content' }}>
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}


