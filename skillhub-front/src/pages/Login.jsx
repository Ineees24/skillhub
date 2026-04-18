import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginData, setLoginData] = useState({ email: '', password: '' })

  const redirectByRole = (user) => {
    if (user.role === 'FORMATEUR') navigate('/formateur')
    else navigate('/apprenant')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(loginData.email, loginData.password)
      redirectByRole(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow login-glow--1" />
      <div className="login-glow login-glow--2" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <span className="login-logo-icon">⚡</span>
          <span className="login-logo-text">SkillHub</span>
        </div>

        <p className="login-tagline">La plateforme d'ateliers courts pour votre reconversion</p>

        {/* Error */}
        {error && (
          <div className="login-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="vous@exemple.com"
              value={loginData.email}
              onChange={e => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-field">
            <label>Mot de passe</label>
            <input
              type="password"
              placeholder="••••••••"
              value={loginData.password}
              onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login