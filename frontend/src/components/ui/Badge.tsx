import React from 'react';

interface BadgeProps {
  variant?: 'on_track' | 'near_limit' | 'over_budget' | 'info' | 'default';
  children: React.ReactNode;
}

export default function Badge({ variant = 'default', children }: BadgeProps) {
  let bg = 'var(--bg-card-hover)';
  let color = 'var(--text-primary)';

  if (variant === 'on_track') {
    bg = 'rgba(34, 197, 94, 0.15)';
    color = 'var(--accent-success)';
  } else if (variant === 'near_limit') {
    bg = 'rgba(245, 158, 11, 0.15)';
    color = 'var(--accent-warning)';
  } else if (variant === 'over_budget') {
    bg = 'rgba(239, 68, 68, 0.15)';
    color = 'var(--accent-danger)';
  } else if (variant === 'info') {
    bg = 'rgba(56, 189, 248, 0.15)';
    color = 'var(--accent-primary)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.625rem',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        textTransform: 'capitalize'
      }}
    >
      {children}
    </span>
  );
}
