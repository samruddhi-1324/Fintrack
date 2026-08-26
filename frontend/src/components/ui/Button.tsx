import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  style,
  disabled,
  ...props
}: ButtonProps) {
  let bg = 'var(--accent-primary)';
  let color = '#000000';
  let border = 'none';

  if (variant === 'secondary') {
    bg = 'var(--bg-card-hover)';
    color = 'var(--text-primary)';
  } else if (variant === 'danger') {
    bg = 'var(--accent-danger)';
    color = '#ffffff';
  } else if (variant === 'outline') {
    bg = 'transparent';
    color = 'var(--text-primary)';
    border = '1px solid var(--border-color)';
  }

  let padding = '0.5rem 1rem';
  let fontSize = '0.875rem';

  if (size === 'sm') {
    padding = '0.25rem 0.625rem';
    fontSize = '0.75rem';
  } else if (size === 'lg') {
    padding = '0.75rem 1.5rem';
    fontSize = '1rem';
  }

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        backgroundColor: bg,
        color,
        border,
        padding,
        fontSize,
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.15s ease-in-out',
        minHeight: '44px',
        ...style
      }}
      {...props}
    >
      {isLoading ? <span>Loading...</span> : children}
    </button>
  );
}
