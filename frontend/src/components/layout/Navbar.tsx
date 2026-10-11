import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  Target, FileText, History, LayoutDashboard,
  LogOut, Menu, X, ChevronRight, Play
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
        { to: '/resumes', label: 'Resumes', icon: <FileText size={14} /> },
        { to: '/history', label: 'History', icon: <History size={14} /> },
      ]
    : [
        { to: '/#how-it-works', label: 'How It Works', icon: null },
      ];

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--color-navbar-bg)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--color-border)',
          transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
        }}
      >
        <div className="container" style={{ maxWidth: 'var(--max-w)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '3.5rem' }}>
            {/* Wordmark */}
            <Link
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}
            >
              {/* Brand mark: square with target icon */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  background: 'var(--color-ink)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Target size={15} color="var(--color-lime)" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 700,
                  fontSize: '1.0625rem',
                  letterSpacing: '-0.02em',
                  color: 'var(--color-ink)',
                }}
              >
                Interview<span style={{ color: 'var(--color-forest)' }}>IQ</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hide-mobile">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.4rem 0.875rem',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isActive(link.to) ? 'var(--color-forest)' : 'var(--color-muted)',
                    background: isActive(link.to) ? 'var(--color-forest-light)' : 'transparent',
                    transition: 'all var(--transition-fast)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(link.to)) {
                      e.currentTarget.style.color = 'var(--color-ink)';
                      e.currentTarget.style.background = 'var(--color-paper-dark)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(link.to)) {
                      e.currentTarget.style.color = 'var(--color-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Theme Toggle (Desktop) */}
              <ThemeToggle className="hide-mobile" />

              {user ? (
                <>
                  {/* User identity */}
                  <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        background: 'var(--color-forest)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-lime-text)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      {(user.full_name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-ink)' }}>
                      {user.full_name?.split(' ')[0] || 'Student'}
                    </span>
                  </div>

                  {/* Start Interview CTA */}
                  <Link
                    to="/interview/new"
                    className="btn btn-primary btn-sm hide-mobile"
                    style={{ gap: '0.375rem' }}
                  >
                    <Play size={12} strokeWidth={3} />
                    Start Practice
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="hide-mobile"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.4rem',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
                  >
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hide-mobile"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'var(--color-muted)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
                  >
                    Sign in
                  </Link>
                  <Link to="/interview/new" className="btn btn-primary btn-sm hide-mobile">
                    Start practising
                    <ChevronRight size={14} />
                  </Link>
                </>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="show-mobile-only"
                style={{
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  padding: '0.375rem',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '82%',
              maxWidth: '320px',
              height: '100%',
              background: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              boxShadow: 'var(--color-card-shadow)',
              color: 'var(--color-ink)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '24px', height: '24px', background: 'var(--color-ink)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={13} color="var(--color-lime)" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>InterviewIQ</span>
              </div>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Mobile Theme Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', color: 'var(--color-muted)' }}>Theme Mode</span>
              <ThemeToggle showLabel />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  color: isActive(link.to) ? 'var(--color-forest)' : 'var(--color-ink)',
                  background: isActive(link.to) ? 'var(--color-forest-light)' : 'transparent',
                  textDecoration: 'none',
                  border: `1px solid ${isActive(link.to) ? 'var(--color-forest)' : 'transparent'}`,
                }}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {user ? (
                <>
                  <Link
                    to="/interview/new"
                    className="btn btn-primary"
                    style={{ justifyContent: 'center' }}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Play size={14} strokeWidth={3} />
                    Start Practice
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-ghost"
                    style={{ justifyContent: 'center', width: '100%' }}
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/interview/new" className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                    Start practising
                  </Link>
                  <Link to="/login" className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
