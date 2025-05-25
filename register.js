import { useState, useEffect } from 'react'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState(null)
  const [message, setMessage] = useState('')
  const [invitedCount, setInvitedCount] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferralCode(ref)
      localStorage.setItem('referral_code', ref)
    } else {
      setReferralCode(localStorage.getItem('referral_code'))
    }
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('Registering...')

    const res = await fetch('http://localhost:4000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        email,
        password,
        referred_by: referralCode,
      }),
    })
    const data = await res.json()

    if (data.error) {
      setMessage('Error: ' + data.error)
    } else {
      setMessage('Registered! Your referral code: ' + data.referral_code)
      checkInvited(data.referral_code)
    }
  }

  const checkInvited = async (code) => {
    const res = await fetch(`http://localhost:4000/invited/${code}`)
    const data = await res.json()
    setInvitedCount(data.invited_count)
  }

  return (
    <div style={{background: '#121212', color: '#eee', padding: 20}}>
      <h2>Register to win iPhone</h2>
      <form onSubmit={handleRegister}>
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={{display: 'block', marginBottom: 10}}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{display: 'block', marginBottom: 10}}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{display: 'block', marginBottom: 10}}
        />
        <button type="submit" style={{background: '#0f0', padding: 10, border: 'none', cursor: 'pointer'}}>
          Register
        </button>
      </form>
      <p>{message}</p>
      <p>Invited friends: {invitedCount} / 25</p>
      {invitedCount >= 25 && (
        <div style={{marginTop: 20}}>
          <h3>You invited 25 friends! Please enter delivery info:</h3>
          {/* Тут форма доставки, оплату и т.д. можно добавить */}
        </div>
      )}
    </div>
  )
}