import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Target, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both your email address and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch {
      setError('Demo sign in failed');
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
            Welcome back
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            Sign in to your InterviewIQ account
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
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label className="form-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="form-input"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              autoComplete="current-password"
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
              <>Sign in <ArrowRight size={14} /></>
            )}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            margin: 'var(--space-5) 0',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="btn btn-outline"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Instant demo — no setup required
        </button>

        <p
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: 'var(--color-muted)',
            marginTop: 'var(--space-5)',
          }}
        >
          No account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--color-forest)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};
