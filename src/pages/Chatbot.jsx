import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

const SYSTEM_PROMPT = `You are VidBot, the friendly AI assistant for VidCrews — Africa's platform connecting creative professionals (videographers, cinematographers, editors, photographers, DPs, gaffers, and more) with clients who need their services.

Your job is to:
- Help users navigate the platform
- Answer questions about how VidCrews works
- Give advice on creative production, rates, equipment, and bookings
- Help clients describe what they're looking for in a creative
- Help creatives with their profiles, rates, and how to get booked
- Be knowledgeable about the African creative industry (Ghana, Nigeria, Kenya, South Africa, etc.)

Keep responses concise, friendly, and practical. You can use occasional African slang like "chale" or "omo" to feel local. Never make up specific user data — if they ask about their account, tell them to check their profile or dashboard.`

export default function Chatbot({ go }) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey${profile ? ' ' + (profile.full_name?.split(' ')[0] || profile.username) : ''}! 👋 I'm VidBot, your creative industry assistant. Ask me anything about VidCrews, production rates, equipment, or finding the right crew. Chale, what's on your mind?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://ihgyuvmgxooqpxrkghbx.supabase.co/functions/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-allow-browser': 'true' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...messages, userMsg].filter(m => m.role !== 'system')
        })
      })

      const data = await response.json()
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Try again?"
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Eish, something went wrong. Try again in a moment!" }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>AI Assistant</h2>
        <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Ask VidBot anything about the platform or the creative industry</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 560 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {m.role === 'assistant' && (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: 'var(--accent-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>
                  🤖
                </div>
              )}
              <div className={m.role === 'user' ? 'chat-bubble-me' : 'chat-bubble-ai'}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>🤖</div>
              <div className="chat-bubble-ai" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={{ animation: 'pulse 1s infinite' }}>●</span>
                <span style={{ animation: 'pulse 1s .2s infinite' }}>●</span>
                <span style={{ animation: 'pulse 1s .4s infinite' }}>●</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 1 && (
          <div style={{ padding: '0 20px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              'What is VidCrews?',
              'How do I get booked?',
              'What should my day rate be?',
              'How do I write a good bio?',
            ].map(q => (
              <button key={q} onClick={() => { setInput(q); }} className="pill" style={{ fontSize: 11 }}>{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
          <textarea
            className="inp"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask VidBot anything... (Enter to send)"
            style={{ flex: 1, minHeight: 'auto', height: 40, resize: 'none', padding: '9px 12px', lineHeight: 1.4 }}
          />
          <button className="btn" onClick={send} disabled={!input.trim() || loading}
            style={{ padding: '9px 16px', flexShrink: 0, opacity: !input.trim() ? 0.4 : 1 }}>
            Send
          </button>
        </div>
      </div>

      {/* Customer service WhatsApp */}
      <div className="card" style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Need to talk to a real person?</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Our support team is available on WhatsApp</div>
        </div>
        <a
          href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '233000000000'}?text=Hi, I need help with VidCrews`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#25d366', color: '#fff', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          💬 WhatsApp Us
        </a>
      </div>
    </div>
  )
}
