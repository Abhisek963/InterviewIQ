import React from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';

export const Footer: React.FC = () => (
  <footer
    style={{
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-white)',
      padding: 'var(--space-10) 0 var(--space-8)',
    }}
  >
    <div className="container">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 'var(--space-10)',
          marginBottom: 'var(--space-8)',
        }}
        className="footer-grid"
      >
        {/* Brand col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 'var(--space-3)' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                background: 'var(--color-ink)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Target size={13} color="var(--color-lime)" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '-0.02em' }}>InterviewIQ</span>
          </div>
          <p
            style={{
              fontSize: '0.875rem',
              lineHeight: 1.65,
              color: 'var(--color-muted)',
              maxWidth: '280px',
              margin: '0 0 var(--space-4)',
            }}
          >
            Resume-aware AI mock interviews for college students preparing for campus placements and software engineering roles.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--color-border)',
              letterSpacing: '0.06em',
            }}
          >
            © {new Date().getFullYear()} INTERVIEWIQ
          </p>
        </div>

        {/* Platform links */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Platform
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Resume Parser', to: '/resumes' },
              { label: 'Mock Interview', to: '/interview/new' },
              { label: 'Performance History', to: '/history' },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-muted)',
                    textDecoration: 'none',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
              marginBottom: 'var(--space-4)',
            }}
          >
            Legal
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {['Privacy Policy', 'Terms of Service', 'Contact'].map((label) => (
              <li key={label}>
                <a
                  href="#"
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-muted)',
                    textDecoration: 'none',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-ink)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-5)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
          Built for campus placements &amp; software engineering candidates.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            color: 'var(--color-border)',
            letterSpacing: '0.06em',
            margin: 0,
          }}
        >
          TEXT-BASED · ROLE-SPECIFIC · ACTIONABLE
        </p>
      </div>
    </div>
  </footer>
);

// Responsive footer grid style
if (typeof document !== 'undefined') {
  const id = 'footer-styles';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @media (max-width: 768px) {
        .footer-grid {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
