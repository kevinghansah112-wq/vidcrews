import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { updateProfile, uploadAvatar, getEquipment, setEquipment } from '../lib/supabase'
import { AFRICAN_COUNTRIES, ROLES, EQUIPMENT } from '../lib/constants'
const CURRENCIES = [
  { code: 'GHS', symbol: 'GHS' },
  { code: 'NGN', symbol: 'NGN' },
  { code: 'KES', symbol: 'KES' },
  { code: 'ZAR', symbol: 'ZAR' },
  { code: 'USD', symbol: 'USD' }
]
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
    full_name: '',
    bio: '',
    role: '',
    city: '',
    country: 'Ghana',
    day_rate: '',
    currency: 'GHS',
    availability: 'available',
    calendly_url: '',
    recovery_email: '',
    phone: '',
    instagram: '',
    website: ''
  })
  useEffect(function() {
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
        phone: profile.phone || '',
        instagram: profile.instagram || '',
        website: profile.website || ''
      })
      setCountry(profile.country || 'Ghana')
      getEquipment(profile.id).then(setEquip)
    }
  }, [profile])
  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>You need an account to edit your profile.</p>
        <button className="btn" onClick={function() { go('auth') }}>Sign up / Log in</button>
      </div>
    )
  }
  var set = function(k, v) { setForm(function(f) { var n = Object.assign({}, f); n[k] = v; return n }) }
  var toggleEquip = function(e) { setEquip(function(p) { return p.includes(e) ? p.filter(function(x) { return x !== e }) : [...p, e] }) }
  var cities = (AFRICAN_COUNTRIES.find(function(c) { return c.name === country }) || {}).cities || []
  var isCreative = profile.user_type === 'creative'
  var handleAvatarUpload = async function(e) {
    var file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      var url = await uploadAvatar(profile.id, file)
      await updateProfile(profile.id, { avatar_url: url })
      await refreshProfile()
      setSaved(true)
      setTimeout(function() { setSaved(false) }, 2000)
    } catch(err) {
      setError('Upload failed: ' + err.message)
    }
    setUploading(false)
  }
  var handleSave = async function() {
    setSaving(true)
    setError(null)
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
        phone: form.phone || null,
        instagram: form.instagram || null,
        website: form.website || null
      })
      if (isCreative) await setEquipment(profile.id, equip)
      await refreshProfile()
      setSaved(true)
      setTimeout(function() { setSaved(false) }, 2000)
    } catch(err) {
      setError(err.message)
    }
    setSaving(false)
  }
  var completeness = [profile.full_name, profile.role, profile.bio, profile.city, profile.day_rate, profile.avatar_url].filter(Boolean).length
  var isVerified = completeness === 6
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Your Profile</h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
          {isCreative ? 'What clients see when they find you' : 'Your account settings'}
        </p>
      </div>
      <div className="profile-layout">
        <div>
          <div className="section-label" style={{ marginBottom: 10 }}>Preview</div>
          <div className="card">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14 }}>
              <div className="av" style={{ width: 72, height: 72, fontSize: 22, marginBottom: 10 }}>
                {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.username} /> : profile.initials}
              </div>
              <button className="btn-s btn-sm" onClick={function() { fileRef.current.click() }} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Change Photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>
                {form.full_name || profile.username}
                {isVerified && <span style={{ marginLeft: 6, fontSize: 12, background: 'var(--yellow)', borderRadius: 20, padding: '2px 8px' }}>Verified</span>}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>@{profile.username}</div>
              {isCreative && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{form.role}</div>}
            </div>
            {isCreative && !isVerified && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>
                  <span>Profile completion</span>
                  <span>{completeness}/6</span>
                </div>
                <div style={{ background: 'var(--border)', borderRadius: 4, height: 5 }}>
                  <div style={{ background: 'var(--yellow)', borderRadius: 4, height: 5, width: ((completeness/6)*100) + '%' }} />
                </div>
              </div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{form.city}, {form.country}</div>
            {isCreative && form.day_rate && (
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>
                {form.currency} {form.day_rate}/day
              </div>
            )}
            {isCreative && profile.points > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--yellow)', fontWeight: 600 }}>
                {profile.points} pts
              </div>
            )}
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Basic Info</div>
            <div className="col">
              <div>
                <div className="lbl">Full Name</div>
                <input className="inp" value={form.full_name} onChange={function(e) { set('full_name', e.target.value) }} />
              </div>
              {isCreative && (
                <div>
                  <div className="lbl">Role</div>
                  <select className="fsel" value={form.role} onChange={function(e) { set('role', e.target.value) }}>
                    {ROLES.map(function(r) { return <option key={r}>{r}</option> })}
                  </select>
                </div>
              )}
              {isCreative && (
                <div>
                  <div className="lbl">Day Rate</div>
                  <div className="row">
                    <select className="fsel" style={{ width: 90, flexShrink: 0 }} value={form.currency} onChange={function(e) { set('currency', e.target.value) }}>
                      {CURRENCIES.map(function(c) { return <option key={c.code} value={c.code}>{c.code}</option> })}
                    </select>
                    <input className="inp" type="number" value={form.day_rate} onChange={function(e) { set('day_rate', e.target.value) }} placeholder="e.g. 900" />
                  </div>
                </div>
              )}
              {isCreative && (
                <div>
                  <div className="lbl">Bio</div>
                  <textarea value={form.bio} onChange={function(e) { set('bio', e.target.value) }} placeholder="Your experience, notable work..." />
                </div>
              )}
              <div>
                <div className="lbl">Country</div>
                <select className="fsel" value={country} onChange={function(e) { setCountry(e.target.value); set('country', e.target.value) }}>
                  {AFRICAN_COUNTRIES.map(function(c) { return <option key={c.name}>{c.name}</option> })}
                </select>
              </div>
              <div>
                <div className="lbl">City</div>
                <select className="fsel" value={form.city} onChange={function(e) { set('city', e.target.value) }}>
                  {cities.map(function(c) { return <option key={c}>{c}</option> })}
                </select>
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Contact and Social</div>
            <div className="col">
              <div>
                <div className="lbl">Phone Number</div>
                <input className="inp" value={form.phone} onChange={function(e) { set('phone', e.target.value) }} placeholder="+233 XX XXX XXXX" />
              </div>
              <div>
                <div className="lbl">Instagram</div>
                <input className="inp" value={form.instagram} onChange={function(e) { set('instagram', e.target.value) }} placeholder="@yourhandle" />
              </div>
              <div>
                <div className="lbl">Website or Portfolio</div>
                <input className="inp" value={form.website} onChange={function(e) { set('website', e.target.value) }} placeholder="https://yoursite.com" />
              </div>
              <div>
                <div className="lbl">Recovery Email</div>
                <input className="inp" type="email" value={form.recovery_email} onChange={function(e) { set('recovery_email', e.target.value) }} placeholder="For password reset" />
              </div>
            </div>
          </div>
          {isCreative && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Availability</div>
              {[['available','Available now'],['soon','Available soon'],['busy','Busy - not available']].map(function(item) {
                return (
                  <label key={item[0]} className="row" style={{ cursor: 'pointer', gap: 8, padding: '4px 0' }}>
                    <input type="radio" name="avail" value={item[0]} checked={form.availability === item[0]} onChange={function() { set('availability', item[0]) }} />
                    <span style={{ fontSize: 13 }}>{item[1]}</span>
                  </label>
                )
              })}
            </div>
          )}
          {isCreative && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Calendly Link</div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Let clients book you directly.</p>
              <input className="inp" value={form.calendly_url} onChange={function(e) { set('calendly_url', e.target.value) }} placeholder="https://calendly.com/your-name" />
            </div>
          )}
          {isCreative && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Equipment</div>
              <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>Select all that apply</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {EQUIPMENT.map(function(e) {
                  return (
                    <button key={e} className={equip.includes(e) ? 'pill on' : 'pill'} onClick={function() { toggleEquip(e) }}>{e}</button>
                  )
                })}
              </div>
            </div>
          )}
          {error && <div className="err-box">{error}</div>}
          <button className="btn" onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', width: 'fit-content' }}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}