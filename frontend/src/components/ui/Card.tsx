import React from 'react';

/* ─── Card ────────────────────────────────────────────────────────────────── */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'paper' | 'forest' | 'ink';
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  style,
}) => {
  const base: React.CSSProperties = {
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--color-card-shadow)',
    transition: 'background-color var(--transition-fast), border-color var(--transition-fast)',
  };

  const variants: Record<string, React.CSSProperties> = {
    default: { background: 'var(--color-surface)', color: 'var(--color-ink)' },
    paper:   { background: 'var(--color-paper)', color: 'var(--color-ink)' },
    forest:  { background: 'var(--color-forest)', color: 'var(--color-lime-text)', borderColor: 'transparent' },
    ink:     { background: 'var(--color-surface-hover)', color: 'var(--color-ink)', borderColor: 'var(--color-border)' },
  };

  return (
    <div style={{ ...base, ...variants[variant], ...style }} className={className}>
      {children}
    </div>
  );
};

/* ─── Badge ────────────────────────────────────────────────────────────────── */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'forest' | 'muted' | 'lime' | 'error' | 'green' | 'yellow' | 'red' | 'indigo' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'muted',
  className = '',
}) => {
  // Map variant names to CSS badge classes
  const classMap: Record<string, string> = {
    forest: 'badge badge-forest',
    muted:  'badge badge-muted',
    lime:   'badge badge-lime',
    error:  'badge badge-error',
    // Legacy mappings
    green:  'badge badge-forest',
    yellow: 'badge bg-amber-50',
    red:    'badge badge-error',
    indigo: 'badge badge-forest',
    slate:  'badge badge-muted',
  };

  return (
    <span className={`${classMap[variant] || 'badge badge-muted'} ${className}`}>
      {children}
    </span>
  );
};

/* ─── ProgressBar ──────────────────────────────────────────────────────────── */
interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string; // legacy support
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  color,
  className = '',
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs">
          {label && <span className="font-medium text-[var(--color-ink)]">{label}</span>}
          {showValue && <span className="font-mono font-bold text-[var(--color-ink)]">{percent}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-[var(--color-paper-dark)] border border-[var(--color-border)] overflow-hidden">
        <div
          className="h-full bg-[var(--color-forest)] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
