'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  interactive?: boolean;
}

export default function Card({ children, style, interactive = true, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={interactive ? {
        y: -3,
        borderColor: 'rgba(16, 185, 129, 0.35)',
        boxShadow: '0 12px 24px -6px rgba(0, 0, 0, 0.3), 0 0 16px rgba(16, 185, 129, 0.12)'
      } : undefined}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-md)',
        ...style
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
