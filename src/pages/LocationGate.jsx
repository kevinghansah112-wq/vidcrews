import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AFRICAN_COUNTRIES } from '../lib/constants'

export default function LocationGate({ location, setLocation, go }) {
  const { profile } = useAuth()
  const [detecting, setDetecting] = useState(false)
  const [country, setCountry] = useState('Ghana')

  const cities = AFRICAN_COUNTRIES.find(c => c.name === country)?.cities || []

  const useGPS = () => {
    setDetecting(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocation({ country: 'Ghana', city: 'Accra' })
          setTimeout(() => go('browse'), 600)
        },
        () => setDetecting(false)
      )
    } else {
      setTimeout(() => { setLocation({ country, city: cities[0] }); go('browse') }, 800)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', textAlign: 'center', padding: '0 16px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Find crew near you</h2>
      <p style={{ color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
        VidCrews connects you with creative professionals across Africa.
      </p>

      {detecting ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text-2)' }}>
          <div className="spinner" />
          Getting your location...
        </div>
      ) : (
        <div className="col">
          <button className="btn" onClick={useGPS} style={{ padding: 11, width: '100%', fontSize: 14 }}>
            📍 Use My Location
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>or choose manually</span>
            <hr className="divider" style={{ flex: 1, margin: 0 }} />
          </div>

          <div>
            <div className="lbl">Country</div>
            <select className="fsel" value={country} onChange={e => setCountry(e.target.value)}>
              {AFRICAN_COUNTRIES.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <div className="lbl">City</div>
            <select className="fsel" onChange={e => setLocation({ country, city: e.target.value })}
              defaultValue={cities[0]}>
              {cities.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <button className="btn-s" onClick={() => {
            setLocation(l => ({ ...l, country }))
            go('browse')
          }} style={{ padding: 10, width: '100%' }}>
            Continue →
          </button>

          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Have an account?{' '}
            <span onClick={() => go('auth')} style={{ color: 'var(--text)', cursor: 'pointer', textDecoration: 'underline' }}>
              Log in
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
