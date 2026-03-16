import { useState } from 'react'

export default function PasswordInput({ value, onChange, placeholder = '••••••••', id }) {
  const [show, setShow] = useState(false)

  return (
    <div className="pw-wrap">
      <input
        id={id}
        className="inp"
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button
        type="button"
        className="pw-eye"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  )
}
