import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Target, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Full name, email address, and password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const result = await register(email, password, fullName, collegeName);
      if (result.requiresVerification) {
        setSuccessMessage('Account registered! Supabase has sent a confirmation link to your email. Please verify your email before logging in.');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 3.5rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        background: 'var(--color-paper)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--color-white)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: 'var(--space-8)',
          boxShadow: 'var(--color-card-shadow)',
        }}
      >
        {/* Brand mark */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              background: 'var(--color-ink)',
              borderRadius: '6px',
              marginBottom: 'var(--space-4)',
            }}
          >
            <Target size={18} color="var(--color-lime)" />
          </div>
          <h1
            style={{
              margin: '0 0 var(--space-1)',
              fontSize: '1.375rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
            }}
          >
            Create account
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            Start preparing for campus placements
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: '#FEF2F2',
              border: '1px solid rgba(185,56,50,0.2)',
              borderRadius: '6px',
              marginBottom: 'var(--space-4)',
              fontSize: '0.875rem',
              color: 'var(--color-error)',
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              background: 'var(--color-forest-light)',
              border: '1px solid var(--color-forest)',
              borderRadius: '6px',
              marginBottom: 'var(--space-4)',
              fontSize: '0.875rem',
              color: 'var(--color-forest)',
            }}
          >
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: 0, fontWeight: 500 }}>{successMessage}</p>
              <Link to="/login" style={{ display: 'inline-block', marginTop: '0.5rem', fontWeight: 700, textDecoration: 'underline' }}>
                Proceed to Sign in →
              </Link>
            </div>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="form-input"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
                className="form-input"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="reg-college">
                College / University <span style={{ color: 'var(--color-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                id="reg-college"
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="Institute of Technology"
                className="form-input"
                autoComplete="organization"
              />
            </div>

            <div>
              <label className="form-label" htmlFor="reg-password">Password (minimum 6 characters)</label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="btn btn-primary"
              style={{ justifyContent: 'center', marginTop: 'var(--space-2)' }}
            >
              {loading ? (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              ) : (
                <>Create account <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        )}

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: 'var(--color-muted)',
            marginTop: 'var(--space-5)',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
