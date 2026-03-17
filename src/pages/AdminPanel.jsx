import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getAllProfiles, updateProfileStatus, getReports } from '../lib/supabase'

const STATUS_BADGE = {
  active:  { cls: 'badge badge-green',  label: 'Active' },
  pending: { cls: 'badge badge-orange', label: 'Pending' },
  flagged: { cls: 'badge badge-red',    label: 'Flagged' },
  banned:  { cls: 'badge badge-gray',   label: 'Banned' },
}

export default function AdminPanel({ go }) {
  const { profile } = useAuth()
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Overview')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!profile?.is_admin) { go('browse'); return }
    Promise.all([getAllProfiles(), getReports()])
      .then(([u, r]) => { setUsers(u); setReports(r) })
      .finally(() => setLoading(false))
  }, [profile])

  if (!profile?.is_admin) return null

  const stats = {
    total: users.length,
    creatives: users.filter(u => u.user_type === 'creative').length,
    clients: users.filter(u => u.user_type === 'client').length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    flagged: users.filter(u => u.status === 'flagged').length,
    reports: reports.filter(r => r.status === 'pending').length,
  }

  const handleStatus = async (id, status) => {
    await updateProfileStatus(id, status)
    setUsers(u => u.map(x => x.id === id ? { ...x, status } : x))
    if (selected?.id === id) setSelected(s => ({ ...s, status }))
  }

  const filtered = () => {
    let list = users
    if (tab === 'Creatives') list = list.filter(u => u.user_type === 'creative')
    else if (tab === 'Clients') list = list.filter(u => u.user_type === 'client')
    else if (tab === 'Pending') list = list.filter(u => u.status === 'pending')
    else if (tab === 'Flagged') list = list.filter(u => u.status === 'flagged')
    if (search) list = list.filter(u => u.username?.includes(search) || u.full_name?.toLowerCase().includes(search.toLowerCase()))
    return list
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Admin Panel</h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Manage users and platform settings</p>
        </div>
        <span className="badge badge-yellow" style={{ padding: '4px 12px', fontSize: 11, letterSpacing: 1 }}>ADMIN</span>
      </div>

      <div className="filters" style={{ marginBottom: 24 }}>
        {['Overview','Creatives','Clients','Pending','Flagged','Reports'].map(t => (
          <button key={t} className={`pill ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t}
            {t === 'Pending' && stats.pending > 0 && <span style={{ background: 'var(--orange)', color: '#fff', borderRadius: '50%', fontSize: 10, padding: '1px 5px', marginLeft: 5 }}>{stats.pending}</span>}
            {t === 'Reports' && stats.reports > 0 && <span style={{ background: 'var(--red)', color: '#fff', borderRadius: '50%', fontSize: 10, padding: '1px 5px', marginLeft: 5 }}>{stats.reports}</span>}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div>
          <div className="g4" style={{ marginBottom: 24 }}>
            {[['Total Users',stats.total,'var(--text)'],['Creatives',stats.creatives,'var(--text)'],['Clients',stats.clients,'var(--text)'],['Pending',stats.pending,'var(--orange)']].map(([l,v,c]) => (
              <div key={l} className="stat-card"><div className="stat-v" style={{ color: c }}>{v}</div><div className="stat-l">{l}</div></div>
            ))}
          </div>
          <div className="g2">
            <div>
              <div className="section-label">Pending Approval</div>
              <div className="col">
                {users.filter(u => u.status === 'pending').slice(0, 5).map(u => (
                  <div key={u.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, cursor: 'pointer' }} onClick={() => setSelected(u)}>
                    <div className="av" style={{ width: 34, height: 34, fontSize: 12 }}>{u.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>@{u.username}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.user_type} · {u.city}</div>
                    </div>
                    <button className="btn-success btn-sm" onClick={e => { e.stopPropagation(); handleStatus(u.id, 'active') }}>Approve</button>
                  </div>
                ))}
                {stats.pending === 0 && <div className="card" style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: 24 }}>All caught up ✓</div>}
              </div>
            </div>
            <div>
              <div className="section-label">Recent Reports</div>
              <div className="col">
                {reports.slice(0, 5).map(r => (
                  <div key={r.id} className="card" style={{ padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 500, fontSize: 13 }}>@{r.reported?.username}</span>
                      <span className="badge badge-red" style={{ fontSize: 10 }}>{r.reason}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Reported by @{r.reporter?.username}</div>
                    {r.details && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 4 }}>{r.details}</div>}
                  </div>
                ))}
                {reports.length === 0 && <div className="card" style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: 24 }}>No reports</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Reports' && (
        <div className="col">
          {reports.map(r => (
            <div key={r.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>@{r.reported?.username} <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 400 }}>{r.reported?.role}</span></div>
                <span className="badge badge-red">{r.reason}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 8 }}>Reported by @{r.reporter?.username} · {new Date(r.created_at).toLocaleDateString()}</div>
              {r.details && <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 12 }}>{r.details}</div>}
              <div className="row" style={{ gap: 8 }}>
                <button className="btn-danger btn-sm" onClick={() => handleStatus(r.reported_id, 'flagged')}>Flag Account</button>
                <button className="btn-s btn-sm">Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {['Creatives','Clients','Pending','Flagged'].includes(tab) && (
        <div>
          <div style={{ marginBottom: 14 }}>
            <input className="inp" placeholder="Search by username or name..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 320 }} />
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>User</th><th>Type</th><th>Role</th><th>City</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered().map(u => {
                    const b = STATUS_BADGE[u.status] || STATUS_BADGE.active
                    return (
                      <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(u)}>
                        <td>
                          <div className="row" style={{ gap: 8 }}>
                            <div className="av" style={{ width: 30, height: 30, fontSize: 11 }}>{u.initials}</div>
                            <div>
                              <div style={{ fontWeight: 500 }}>@{u.username}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.full_name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-2)' }}>{u.user_type}</td>
                        <td style={{ color: 'var(--text-3)' }}>{u.role || '-'}</td>
                        <td style={{ color: 'var(--text-3)' }}>{u.city}</td>
                        <td><span className={b.cls}>{b.label}</span></td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="row" style={{ gap: 6 }}>
                            {u.status === 'pending' && <button className="btn-success btn-sm" onClick={() => handleStatus(u.id, 'active')}>Approve</button>}
                            {u.status === 'active' && <button className="btn-danger btn-sm" onClick={() => handleStatus(u.id, 'flagged')}>Flag</button>}
                            {u.status === 'flagged' && <button className="btn-danger btn-sm" onClick={() => handleStatus(u.id, 'banned')}>Ban</button>}
                            {u.status === 'banned' && <button className="btn-success btn-sm" onClick={() => handleStatus(u.id, 'active')}>Restore</button>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filtered().length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 32 }}>No users found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User detail drawer */}
      <div className={`overlay ${selected ? 'open' : ''}`} onClick={() => setSelected(null)}>
        <div className="drawer" onClick={e => e.stopPropagation()}>
          {selected && (() => {
            const b = STATUS_BADGE[selected.status] || STATUS_BADGE.active
            return (
              <>
                <div className="row" style={{ marginBottom: 20 }}>
                  <div className="av" style={{ width: 48, height: 48, fontSize: 15 }}>{selected.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>@{selected.username}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{selected.user_type} · {selected.city}, {selected.country}</div>
                  </div>
                  <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-3)' }}>✕</button>
                </div>
                <div className="row" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <span className={b.cls}>{b.label}</span>
                  {selected.is_verified && <span className="badge badge-yellow">✓ Verified</span>}
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>⭐ {selected.points || 0} pts</span>
                </div>
                {selected.bio && <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>{selected.bio}</p>}
                <hr className="divider" />
                <div className="section-label" style={{ marginBottom: 10 }}>Admin Actions</div>
                <div className="col">
                  {selected.status === 'pending' && <button className="btn-success" onClick={() => handleStatus(selected.id, 'active')} style={{ padding: '9px 16px' }}>✓ Approve</button>}
                  {selected.status === 'active' && <button className="btn-danger" onClick={() => handleStatus(selected.id, 'flagged')} style={{ padding: '9px 16px' }}>⚑ Flag</button>}
                  {(selected.status === 'flagged' || selected.status === 'pending') && <button className="btn-danger" onClick={() => handleStatus(selected.id, 'banned')} style={{ padding: '9px 16px' }}>🚫 Ban</button>}
                  {selected.status === 'banned' && <button className="btn-success" onClick={() => handleStatus(selected.id, 'active')} style={{ padding: '9px 16px' }}>↩ Restore</button>}
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
