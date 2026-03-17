export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--surface)',
      padding: '32px 24px',
      marginTop: 40
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>VidCrews</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
              Africa's creative crew platform. Find videographers, DPs, editors and more across the continent.
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Platform</div>
            <div className="col" style={{ gap: 8 }}>
              {[['Browse Crew', 'browse'], ['Job Board', 'jobs'], ['Sign Up', 'auth']].map(([l, s]) => (
                <span key={l} style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>{l}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>Connect</div>
            <div className="col" style={{ gap: 8 }}>
              <a href="https://tiktok.com/@vidcrews.africa" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none' }}>TikTok</a>
              <a href="https://instagram.com/vidcrews" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--text-2)', textDecoration: 'none' }}>Instagram</a>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            2025 VidCrews. Made in Ghana for Africa.
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Built with love by <a href="https://instagram.com/kevthedp" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>@kevthedp</a>
          </div>
        </div>
      </div>
    </footer>
  )
}