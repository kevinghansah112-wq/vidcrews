import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getCreativesNearCity, getEquipment, toggleShortlist, getShortlist, reportUser } from '../lib/supabase'
import { getCurrencySymbol, REPORT_REASONS } from '../lib/constants'
export default function Browse({ location, go }) {
  const { profile } = useAuth()
  const [crew, setCrew] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleF, setRoleF] = useState('All')
  const [availF, setAvailF] = useState('All')
  const [selected, setSelected] = useState(null)
  const [selEquip, setSelEquip] = useState([])
  const [shortlist, setShortlist] = useState([])
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0])
  const [reportDetails, setReportDetails] = useState('')
  const [actionMsg, setActionMsg] = useState(null)
  useEffect(() => {
    setLoading(true)
    getCreativesNearCity(location?.city, location?.country)
      .then(setCrew)
      .finally(() => setLoading(false))
  }, [location])
  useEffect(() => {
    if (profile) getShortlist(profile.id).then(setShortlist)
  }, [profile])
  const openProfile = async (p) => {
    setSelected(p)
    setSelEquip([])
    setReportOpen(false)
    const eq = await getEquipment(p.id)
    setSelEquip(eq)
  }
  const roles = ['All', ...new Set(crew.map(u => u.role).filter(Boolean))]
  const list = crew.filter(u => {
    if (roleF !== 'All' && u.role !== roleF) return false
    if (availF !== 'All' && u.availability !== availF) return false
    return true
  })
  const sym = (p) => getCurrencySymbol(p?.currency)
  const handleSave = async (id) => {
    if (!profile) { go('auth'); return }
    const isSaved = shortlist.includes(id)
    await toggleShortlist(profile.id, id, isSaved)
    setShortlist(s => isSaved ? s.filter(x => x !== id) : [...s, id])
  }
  const handleReport = async () => {
    if (!profile || !selected) return
    await reportUser(profile.id, selected.id, reportReason, reportDetails)
    setReportOpen(false)
    setReportDetails('')
    setActionMsg('Report submitted.')
    setTimeout(() => setActionMsg(null), 3000)
  }
  const handleWhatsApp = (p) => {
    const phone = p.phone ? p.phone.replace(/[^0-9]/g, '') : null
    if (!phone) {
      setActionMsg('This creative has not added a phone number yet.')
      setTimeout(() => setActionMsg(null), 3000)
      return
    }
    const msg = encodeURIComponent('Hi ' + (p.full_name || p.username) + ', I found you on VidCrews and would like to work with you.')
    window.open('https://wa.me/' + phone + '?text=' + msg, '_blank')
  }
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" />
    </div>
  )
  return (
    <div>
      {actionMsg && (
        <div className="ok-box fade-in" style={{ marginBottom: 16 }}>{actionMsg}</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
            Crew near {location?.city || location?.country}
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>
            {list.filter(u => u.availability === 'available').length} available
          </p>
        </div>
        {!profile && <button className="btn btn-sm" onClick={() => go('auth')}>Join to Connect</button>}
      </div>
      <div className="filters">
        {roles.map(r => (
          <button key={r} className={'pill ' + (roleF === r ? 'on' : '')} onClick={() => setRoleF(r)}>{r}</button>
        ))}
      </div>
      <div className="filters" style={{ marginBottom: 24 }}>
        {[['All','All'],['available','Available'],['soon','Available Soon'],['busy','Busy']].map(([v,l]) => (
          <button key={v} className={'pill ' + (availF === v ? 'on' : '')} onClick={() => setAvailF(v)}>{l}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
          No creatives found yet.
        </div>
      ) : (
        <div className="ga">
          {list.map(p => (
            <div key={p.id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => openProfile(p)}>
              <div className="row" style={{ marginBottom: 12 }}>
                <div className="av" style={{ width: 44, height: 44, fontSize: 14 }}>
                  {p.avatar_url ? <img src={p.avatar_url} alt={p.username} /> : p.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.full_name || p.username}</span>
                    {p.is_verified && <span className="verified-badge">V</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>@{p.username}</div>
                </div>
                <div className={'dot dot-' + (p.availability === 'available' ? 'green' : p.availability === 'soon' ? 'orange' : 'gray')} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>
                {p.role} - {p.city}, {p.country}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}>
                {p.bio ? p.bio.substring(0, 80) : 'No bio yet.'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--yellow)', fontWeight: 600 }}>
                  {p.points > 0 ? p.points + ' pts' : ''}
                </span>
                {p.day_rate && (
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {sym(p)}{p.day_rate}/day
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={'overlay ' + (selected ? 'open' : '')} onClick={() => setSelected(null)}>
        <div className="drawer fade-in" onClick={e => e.stopPropagation()}>
          {selected && (
            <div>
              <div className="row" style={{ marginBottom: 16 }}>
                <div className="av" style={{ width: 52, height: 52, fontSize: 16 }}>
                  {selected.avatar_url ? <img src={selected.avatar_url} alt={selected.username} /> : selected.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{selected.full_name || selected.username}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>@{selected.username} - {selected.role}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{selected.city}, {selected.country}</div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-3)' }}>X</button>
              </div>
              <div className="g2" style={{ marginBottom: 16 }}>
                <div className="stat-card">
                  <div className="stat-v">{sym(selected)}{selected.day_rate || '0'}</div>
                  <div className="stat-l">Day Rate</div>
                </div>
                <div className="stat-card">
                  <div className="stat-v" style={{ fontSize: 14 }}>
                    {selected.availability === 'available' ? 'Open' : selected.availability === 'soon' ? 'Soon' : 'Busy'}
                  </div>
                  <div className="stat-l">Availability</div>
                </div>
              </div>
              {selected.points > 0 && (
                <div style={{ background: 'var(--yellow-bg)', border: '1px solid var(--yellow)', borderRadius: 8, padding: '8px 12px', marginBottom: 14, fontSize: 12, color: 'var(--yellow)', fontWeight: 600 }}>
                  {selected.points} points earned
                </div>
              )}
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>{selected.bio || 'No bio yet.'}</p>
              {selEquip.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div className="lbl" style={{ marginBottom: 8 }}>Equipment</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selEquip.map(e => <span key={e} className="tag">{e}</span>)}
                  </div>
                </div>
              )}
              {selected.instagram && (
                <a href={'https://instagram.com/' + selected.instagram.replace('@','')} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text)', textDecoration: 'none', marginBottom: 10 }}>
                  Instagram: @{selected.instagram.replace('@','')}
                </a>
              )}
              {selected.website && (
                <a href={selected.website} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text)', textDecoration: 'none', marginBottom: 10 }}>
                  Portfolio / Website
                </a>
              )}
              {selected.calendly_url && (
                <a href={selected.calendly_url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--text)', textDecoration: 'none', marginBottom: 14 }}>
                  View Calendly Availability
                </a>
              )}
              <hr className="divider" />
              <div className="col" style={{ marginTop: 14 }}>
                {profile ? (
                  <div>
                    <button className="btn" style={{ padding: 10, width: '100%', marginBottom: 8, background: '#25d366' }}
                      onClick={() => handleWhatsApp(selected)}>
                      WhatsApp
                    </button>
                    <button className="btn-s" style={{ padding: 9, width: '100%', marginBottom: 8 }} onClick={() => handleSave(selected.id)}>
                      {shortlist.includes(selected.id) ? 'Saved' : 'Save to Shortlist'}
                    </button>
                    {!reportOpen && profile.id !== selected.id && (
                      <button onClick={() => setReportOpen(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 12, cursor: 'pointer', padding: '4px 0', width: '100%', textAlign: 'center' }}>
                        Report this user
                      </button>
                    )}
                  </div>
                ) : (
                  <button className="btn" onClick={() => { setSelected(null); go('auth') }} style={{ padding: 10, width: '100%' }}>
                    Sign up to Connect
                  </button>
                )}
                {reportOpen && profile && profile.id !== selected.id && (
                  <div style={{ background: 'var(--red-bg)', border: '1px solid var(--red)', borderRadius: 8, padding: 14, marginTop: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--red)', marginBottom: 10 }}>Report @{selected.username}</div>
                    <div style={{ marginBottom: 10 }}>
                      <select className="fsel" value={reportReason} onChange={e => setReportReason(e.target.value)}>
                        {REPORT_REASONS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)} placeholder="Details..." style={{ height: 70 }} />
                    </div>
                    <div className="row" style={{ gap: 8 }}>
                      <button className="btn-s btn-sm" onClick={() => setReportOpen(false)}>Cancel</button>
                      <button className="btn-danger btn-sm" onClick={handleReport}>Submit</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}