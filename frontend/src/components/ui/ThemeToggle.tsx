import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../features/theme/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.4rem 0.6rem',
        background: 'var(--color-paper-dark)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        color: 'var(--color-ink)',
        cursor: 'pointer',
        fontSize: '0.75rem',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        transition: 'all var(--transition-fast)',
        userSelect: 'none',
      }}
      className={`theme-toggle ${className}`}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-forest)';
        e.currentTarget.style.color = 'var(--color-forest)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.color = 'var(--color-ink)';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '16px',
          height: '16px',
        }}
      >
        {isDark ? (
          <Sun size={15} className="animate-fade-in" style={{ color: 'var(--color-lime)' }} />
        ) : (
          <Moon size={15} className="animate-fade-in" style={{ color: 'var(--color-forest)' }} />
        )}
      </div>
      {showLabel && (
        <span style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};
