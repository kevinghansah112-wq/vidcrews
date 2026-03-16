import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getMessages, sendMessage, supabase } from '../lib/supabase'

export default function Messages({ go }) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [activeThread, setActiveThread] = useState(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    if (!profile) return
    getMessages(profile.id).then(setMessages)

    const channel = supabase.channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${profile.id}` },
        payload => setMessages(m => [payload.new, ...m]))
      .subscribe()

    return () => channel.unsubscribe()
  }, [profile])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread, messages])

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>You need an account to use messages.</p>
      <button className="btn" onClick={() => go('auth')}>Sign up / Log in</button>
    </div>
  )

  const threads = {}
  messages.forEach(m => {
    const other = m.sender_id === profile.id ? m.receiver : m.sender
    if (!other) return
    if (!threads[other.id]) threads[other.id] = { person: other, msgs: [], unread: 0 }
    threads[other.id].msgs.push(m)
    if (!m.read && m.receiver_id === profile.id) threads[other.id].unread++
  })

  const threadList = Object.values(threads).sort((a, b) => {
    const al = a.msgs[a.msgs.length - 1]?.created_at || ''
    const bl = b.msgs[b.msgs.length - 1]?.created_at || ''
    return bl.localeCompare(al)
  })

  const activeMessages = activeThread
    ? (threads[activeThread]?.msgs || []).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
    : []

  const activePerson = activeThread ? threads[activeThread]?.person : null
  const totalUnread = threadList.reduce((a, t) => a + t.unread, 0)

  const handleSend = async () => {
    if (!draft.trim() || !activeThread) return
    setSending(true)
    try {
      const msg = await sendMessage(profile.id, activeThread, draft.trim())
      setMessages(m => [msg, ...m])
      setDraft('')
    } finally { setSending(false) }
  }

  const fmt = (ts) => {
    if (!ts) return ''
    const d = new Date(ts), now = new Date(), diff = now - d
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>
          Messages {totalUnread > 0 && <span style={{ background: 'var(--accent)', color: 'var(--accent-fg)', borderRadius: '50%', fontSize: 11, fontWeight: 700, padding: '2px 6px', marginLeft: 6 }}>{totalUnread}</span>}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{threadList.length} conversation{threadList.length !== 1 ? 's' : ''}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeThread ? '260px 1fr' : '1fr', gap: 14, minHeight: 500 }}>
        {/* Thread list */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', height: 'fit-content' }}>
          {threadList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 8 }}>No messages yet</div>
              <button className="btn-s btn-sm" onClick={() => go('browse')}>Browse Crew</button>
            </div>
          ) : threadList.map(({ person, msgs, unread }) => {
            const last = msgs[msgs.length - 1]
            const isActive = activeThread === person.id
            return (
              <div key={person.id} onClick={() => setActiveThread(person.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: isActive ? 'var(--surface-2)' : 'var(--surface)', transition: 'background .15s' }}>
                <div className="av" style={{ width: 40, height: 40, fontSize: 13, flexShrink: 0 }}>
                  {person.avatar_url ? <img src={person.avatar_url} alt={person.username} /> : person.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontWeight: unread ? 600 : 500, fontSize: 13 }}>@{person.username}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmt(last?.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {last?.sender_id === profile.id ? 'You: ' : ''}{last?.body || ''}
                  </div>
                </div>
                {unread > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{unread}</div>}
              </div>
            )
          })}
        </div>

        {/* Conversation */}
        {activeThread && (
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 560 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div className="av" style={{ width: 36, height: 36, fontSize: 12 }}>
                {activePerson?.avatar_url ? <img src={activePerson.avatar_url} alt={activePerson.username} /> : activePerson?.initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>@{activePerson?.username}</div>
              </div>
              <button onClick={() => setActiveThread(null)} style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeMessages.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 12, marginTop: 40 }}>Start a conversation with @{activePerson?.username}</div>}
              {activeMessages.map(m => {
                const isMine = m.sender_id === profile.id
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div className={isMine ? 'chat-bubble-me' : 'chat-bubble-ai'}>
                      <div>{m.body}</div>
                      <div style={{ fontSize: 10, marginTop: 3, opacity: 0.5, textAlign: 'right' }}>{fmt(m.created_at)}</div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
              <textarea className="inp" value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Type a message... (Enter to send)"
                style={{ flex: 1, height: 40, resize: 'none', padding: '9px 12px', lineHeight: 1.4 }} />
              <button className="btn" onClick={handleSend} disabled={!draft.trim() || sending}
                style={{ padding: '9px 16px', flexShrink: 0, opacity: !draft.trim() ? 0.4 : 1 }}>
                {sending ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
