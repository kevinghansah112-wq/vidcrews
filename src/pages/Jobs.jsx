import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { AFRICAN_COUNTRIES, ROLES } from '../lib/constants'
async function getJobs() {
  var q = supabase.from('jobs').select('*, poster:profiles!jobs_poster_id_fkey(username, full_name, avatar_url, initials, role, city, country)').eq('status', 'open').order('created_at', { ascending: false })
  var result = await q
  return result.data || []
}
async function postJob(posterId, form) {
  var result = await supabase.from('jobs').insert({ poster_id: posterId, title: form.title, description: form.description, location: form.location, country: form.country, budget: form.budget, is_paid: form.is_paid, roles_needed: form.roles_needed, deadline: form.deadline || null, status: 'open' }).select().single()
  if (result.error) throw result.error
  return result.data
}
async function applyJob(jobId, applicantId, message) {
  var result = await supabase.from('job_applications').insert({ job_id: jobId, applicant_id: applicantId, message: message })
  if (result.error) throw result.error
}
async function deleteJob(id) {
  await supabase.from('jobs').delete().eq('id', id)
}
export default function Jobs({ go }) {
  var auth = useAuth()
  var profile = auth.profile
  var jobs = useState([]); var setJobs = jobs[1]; jobs = jobs[0]
  var loading = useState(true); var setLoading = loading[1]; loading = loading[0]
  var showForm = useState(false); var setShowForm = showForm[1]; showForm = showForm[0]
  var selected = useState(null); var setSelected = selected[1]; selected = selected[0]
  var applyMsg = useState(''); var setApplyMsg = applyMsg[1]; applyMsg = applyMsg[0]
  var applied = useState(false); var setApplied = applied[1]; applied = applied[0]
  var actionMsg = useState(null); var setActionMsg = actionMsg[1]; actionMsg = actionMsg[0]
  var saving = useState(false); var setSaving = saving[1]; saving = saving[0]
  var roleF = useState('All'); var setRoleF = roleF[1]; roleF = roleF[0]
  var form = useState({ title: '', description: '', location: '', country: 'Ghana', budget: '', is_paid: true, roles_needed: [], deadline: '' })
  var setForm = form[1]; form = form[0]
  useEffect(function() {
    getJobs().then(setJobs).catch(function() {}).finally(function() { setLoading(false) })
  }, [])
  function set(k, v) { setForm(function(f) { var n = Object.assign({}, f); n[k] = v; return n }) }
  function toggleRole(r) {
    setForm(function(f) {
      var n = Object.assign({}, f)
      n.roles_needed = n.roles_needed.includes(r) ? n.roles_needed.filter(function(x) { return x !== r }) : [...n.roles_needed, r]
      return n
    })
  }
  async function handlePost() {
    if (!form.title || !form.description) return
    setSaving(true)
    try {
      var job = await postJob(profile.id, form)
      job.poster = { username: profile.username, full_name: profile.full_name, avatar_url: profile.avatar_url, initials: profile.initials, role: profile.role, city: profile.city, country: profile.country }
      setJobs(function(j) { return [job, ...j] })
      setShowForm(false)
      setForm({ title: '', description: '', location: '', country: 'Ghana', budget: '', is_paid: true, roles_needed: [], deadline: '' })
      setActionMsg('Job posted!')
      setTimeout(function() { setActionMsg(null) }, 3000)
    } catch(err) {
      setActionMsg('Error: ' + err.message)
    }
    setSaving(false)
  }
  async function handleApply() {
    if (!profile || !selected) return
    try {
      await applyJob(selected.id, profile.id, applyMsg)
      setApplied(true)
      setActionMsg('Application sent!')
      setTimeout(function() { setActionMsg(null) }, 3000)
    } catch(err) {
      setActionMsg(err.message && err.message.includes('unique') ? 'You already applied to this job.' : 'Error: ' + err.message)
    }
  }
  async function handleDelete(id) {
    await deleteJob(id)
    setJobs(function(j) { return j.filter(function(x) { return x.id !== id }) })
    setSelected(null)
  }
  var allRoles = ['All'].concat(jobs.flatMap(function(j) { return j.roles_needed || [] }).filter(function(v, i, a) { return a.indexOf(v) === i }))
  var filtered = jobs.filter(function(j) { return roleF === 'All' || (j.roles_needed && j.roles_needed.includes(roleF)) })
  function fmt(d) { return d ? new Date(d).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }) : null }
  return (
    <div>
      {actionMsg && <div className="ok-box fade-in" style={{ marginBottom: 16 }}>{actionMsg}</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Job Board</h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{filtered.length} open jobs</p>
        </div>
        {profile && (
          <button className="btn btn-sm" onClick={function() { setShowForm(function(s) { return !s }) }}>
            {showForm ? 'Cancel' : '+ Post a Job'}
          </button>
        )}
      </div>
      {showForm && (
        <div className="card fade-in" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Post a Job</div>
          <div className="col">
            <div>
              <div className="lbl">Job Title</div>
              <input className="inp" value={form.title} onChange={function(e) { set('title', e.target.value) }} placeholder="e.g. DP needed for music video" />
            </div>
            <div>
              <div className="lbl">Description</div>
              <textarea value={form.description} onChange={function(e) { set('description', e.target.value) }} placeholder="Describe the project..." style={{ height: 100 }} />
            </div>
            <div className="g2">
              <div>
                <div className="lbl">Location</div>
                <input className="inp" value={form.location} onChange={function(e) { set('location', e.target.value) }} placeholder="e.g. Accra" />
              </div>
              <div>
                <div className="lbl">Country</div>
                <select className="fsel" value={form.country} onChange={function(e) { set('country', e.target.value) }}>
                  {AFRICAN_COUNTRIES.map(function(c) { return <option key={c.name}>{c.name}</option> })}
                </select>
              </div>
            </div>
            <div className="g2">
              <div>
                <div className="lbl">Payment</div>
                <div className="row" style={{ gap: 12 }}>
                  <label className="row" style={{ cursor: 'pointer', gap: 6 }}>
                    <input type="radio" checked={form.is_paid === true} onChange={function() { set('is_paid', true) }} />
                    <span style={{ fontSize: 13 }}>Paid</span>
                  </label>
                  <label className="row" style={{ cursor: 'pointer', gap: 6 }}>
                    <input type="radio" checked={form.is_paid === false} onChange={function() { set('is_paid', false) }} />
                    <span style={{ fontSize: 13 }}>Unpaid</span>
                  </label>
                </div>
              </div>
              <div>
                <div className="lbl">Budget</div>
                <input className="inp" value={form.budget} onChange={function(e) { set('budget', e.target.value) }} placeholder="e.g. GHS 1200/day" />
              </div>
            </div>
            <div>
              <div className="lbl">Deadline (optional)</div>
              <input className="inp" type="date" value={form.deadline} onChange={function(e) { set('deadline', e.target.value) }} />
            </div>
            <div>
              <div className="lbl" style={{ marginBottom: 8 }}>Roles Needed</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ROLES.map(function(r) {
                  return <button key={r} className={form.roles_needed.includes(r) ? 'pill on' : 'pill'} onClick={function() { toggleRole(r) }}>{r}</button>
                })}
              </div>
            </div>
            <button className="btn" onClick={handlePost} disabled={saving || !form.title || !form.description} style={{ padding: '10px 24px', width: 'fit-content' }}>
              {saving ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </div>
      )}
      <div className="filters" style={{ marginBottom: 20 }}>
        {allRoles.map(function(r) {
          return <button key={r} className={roleF === r ? 'pill on' : 'pill'} onClick={function() { setRoleF(r) }}>{r}</button>
        })}
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-3)' }}>
          No jobs posted yet.
        </div>
      ) : (
        <div className="col">
          {filtered.map(function(j) {
            return (
              <div key={j.id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={function() { setSelected(j); setApplied(false); setApplyMsg('') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{j.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      By @{j.poster && j.poster.username} in {j.location || j.country}
                      {j.deadline ? ' - Deadline: ' + fmt(j.deadline) : ''}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {j.is_paid ? (
                      <span className="badge badge-green">{j.budget || 'Paid'}</span>
                    ) : (
                      <span className="badge badge-gray">Unpaid</span>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 12 }}>
                  {j.description.length > 120 ? j.description.substring(0, 120) + '...' : j.description}
                </p>
                {j.roles_needed && j.roles_needed.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {j.roles_needed.map(function(r) { return <span key={r} className="tag">{r}</span> })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className={selected ? 'overlay open' : 'overlay'} onClick={function() { setSelected(null) }}>
        <div className="drawer fade-in" onClick={function(e) { e.stopPropagation() }}>
          {selected && (
            <div>
              <div className="row" style={{ marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>{selected.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    By @{selected.poster && selected.poster.username} in {selected.location || selected.country}
                  </div>
                </div>
                <button onClick={function() { setSelected(null) }} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-3)' }}>X</button>
              </div>
              <div className="row" style={{ marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
                {selected.is_paid ? (
                  <span className="badge badge-green">{selected.budget || 'Paid'}</span>
                ) : (
                  <span className="badge badge-gray">Unpaid</span>
                )}
                {selected.deadline && <span className="badge badge-orange">Deadline: {fmt(selected.deadline)}</span>}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>{selected.description}</p>
              {selected.roles_needed && selected.roles_needed.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="lbl" style={{ marginBottom: 8 }}>Roles Needed</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selected.roles_needed.map(function(r) { return <span key={r} className="tag">{r}</span> })}
                  </div>
                </div>
              )}
              <hr className="divider" />
              {profile && profile.id !== selected.poster_id && profile.user_type === 'creative' && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Apply for this job</div>
                  {applied ? (
                    <div className="ok-box">Application sent!</div>
                  ) : (
                    <div className="col">
                      <textarea value={applyMsg} onChange={function(e) { setApplyMsg(e.target.value) }}
                        placeholder="Introduce yourself..." style={{ height: 100 }} />
                      <button className="btn" onClick={handleApply} style={{ padding: '10px 20px', width: 'fit-content' }}>
                        Send Application
                      </button>
                    </div>
                  )}
                </div>
              )}
              {profile && profile.id === selected.poster_id && (
                <button className="btn-danger" onClick={function() { handleDelete(selected.id) }} style={{ padding: '9px 16px' }}>
                  Delete Job
                </button>
              )}
              {!profile && (
                <button className="btn" onClick={function() { setSelected(null); go('auth') }} style={{ padding: 10, width: '100%' }}>
                  Sign up to Apply
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}