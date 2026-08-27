'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
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

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.025, y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
      disabled={isDisabled}
      style={{
        backgroundColor: bg,
        color,
        border,
        padding,
        fontSize,
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        minHeight: '44px',
        userSelect: 'none',
        ...style
      }}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid transparent',
              borderTopColor: 'currentColor',
              borderRadius: '50%',
              display: 'inline-block'
            }}
          />
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
