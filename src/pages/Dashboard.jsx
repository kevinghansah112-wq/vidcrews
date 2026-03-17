import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getEarnings, addEarning, deleteEarning } from '../lib/supabase'
import { CURRENCIES, getCurrencySymbol } from '../lib/constants'

export default function Dashboard({ go }) {
  const { profile } = useAuth()
  const [earnings, setEarnings] = useState([])
  const [loading, setLoading] = useState(true)
  const [displayCurrency, setDisplayCurrency] = useState('GHS')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ client_name: '', booking_date: '', day_rate: '', amount_paid: '', currency: 'GHS', note: '' })

  useEffect(() => {
    if (profile) {
      setDisplayCurrency(profile.currency || 'GHS')
      getEarnings(profile.id).then(setEarnings).finally(() => setLoading(false))
    }
  }, [profile])

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>You need an account to view your dashboard.</p>
      <button className="btn" onClick={() => go('auth')}>Sign up / Log in</button>
    </div>
  )

  if (profile.user_type !== 'creative') return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
      <h2 style={{ marginBottom: 8 }}>You're signed up as a client</h2>
      <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>The earnings dashboard is for creatives. Browse crew to find talent for your project.</p>
      <button className="btn" onClick={() => go('browse')}>Browse Crew</button>
    </div>
  )

  // FX rates (approximate)
  const FX = { GHS: 1, NGN: 45, KES: 9, ZAR: 0.48, USD: 0.077 }
  const convert = (amount, fromCurrency) => {
    const inGHS = amount / FX[fromCurrency]
    return Math.round(inGHS * FX[displayCurrency])
  }

  const sym = getCurrencySymbol(displayCurrency)
  const total = earnings.reduce((a, e) => a + convert(e.amount_paid, e.currency), 0)
  const totalDR = earnings.reduce((a, e) => a + convert(e.day_rate, e.currency), 0)
  const diff = total - totalDR

  const handleAdd = async () => {
    if (!form.amount_paid) return
    setSaving(true)
    try {
      const row = await addEarning(profile.id, {
        client_name: form.client_name || 'Client',
        booking_date: form.booking_date || new Date().toISOString().split('T')[0],
        day_rate: parseFloat(form.day_rate) || profile.day_rate || 0,
        amount_paid: parseFloat(form.amount_paid),
        currency: form.currency,
        note: form.note,
      })
      setEarnings(e => [row, ...e])
      setForm({ client_name: '', booking_date: '', day_rate: '', amount_paid: '', currency: profile.currency || 'GHS', note: '' })
      setShowForm(false)
    } finally { setSaving(false) }
  }

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Earnings Dashboard</h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Track what you actually made vs your day rate</p>
        </div>
        <div className="row">
          <select className="fsel" style={{ width: 'auto', padding: '7px 10px', fontSize: 12 }} value={displayCurrency} onChange={e => setDisplayCurrency(e.target.value)}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
          </select>
          <button className="btn btn-sm" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Log Booking'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>New Booking</div>
          <div className="g2" style={{ marginBottom: 12 }}>
            <div><div className="lbl">Client / Production</div><input className="inp" value={form.client_name} onChange={e => setForm(f => ({...f, client_name: e.target.value}))} placeholder="e.g. Afro Pulse Studios" /></div>
            <div><div className="lbl">Date</div><input className="inp" type="date" value={form.booking_date} onChange={e => setForm(f => ({...f, booking_date: e.target.value}))} /></div>
            <div><div className="lbl">Currency</div>
              <select className="fsel" value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <div><div className="lbl">Your Day Rate</div><input className="inp" type="number" value={form.day_rate} onChange={e => setForm(f => ({...f, day_rate: e.target.value}))} placeholder="e.g. 900" /></div>
            <div><div className="lbl">Amount Actually Paid</div><input className="inp" type="number" value={form.amount_paid} onChange={e => setForm(f => ({...f, amount_paid: e.target.value}))} placeholder="e.g. 850" /></div>
            <div><div className="lbl">Note</div><input className="inp" value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} placeholder="e.g. Music video, 2 days" /></div>
          </div>
          <button className="btn" onClick={handleAdd} disabled={saving} style={{ padding: '9px 20px' }}>
            {saving ? 'Saving...' : 'Save Booking'}
          </button>
        </div>
      )}

      <div className="g3" style={{ marginBottom: 24 }}>
        <div className="stat-card"><div className="stat-v">{sym}{total.toLocaleString()}</div><div className="stat-l">Total Earned</div></div>
        <div className="stat-card"><div className="stat-v">{sym}{totalDR.toLocaleString()}</div><div className="stat-l">At Day Rate</div></div>
        <div className="stat-card">
          <div className="stat-v" style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {diff >= 0 ? '+' : ''}{sym}{Math.abs(diff).toLocaleString()}
          </div>
          <div className="stat-l">Difference</div>
        </div>
      </div>

      <div className="section-label">Booking History</div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Date</th><th>Client</th><th>Note</th><th style={{ textAlign: 'right' }}>Rate</th><th style={{ textAlign: 'right' }}>Paid</th><th style={{ textAlign: 'right' }}>Diff</th><th></th></tr>
              </thead>
              <tbody>
                {earnings.map(e => {
                  const dr = convert(e.day_rate, e.currency)
                  const pd = convert(e.amount_paid, e.currency)
                  const df = pd - dr
                  return (
                    <tr key={e.id}>
                      <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{fmt(e.booking_date)}</td>
                      <td style={{ fontWeight: 500 }}>{e.client_name}</td>
                      <td style={{ color: 'var(--text-3)' }}>{e.note}</td>
                      <td style={{ textAlign: 'right' }}>{sym}{dr.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{sym}{pd.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: df >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>
                        {df >= 0 ? '+' : ''}{sym}{Math.abs(df).toLocaleString()}
                      </td>
                      <td>
                        <button onClick={() => { deleteEarning(e.id); setEarnings(p => p.filter(x => x.id !== e.id)) }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 15, padding: '2px 6px' }}>✕</button>
                      </td>
                    </tr>
                  )
                })}
                {earnings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-3)', padding: 32 }}>No bookings logged yet. Click "+ Log Booking" to add one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
