'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Floating3DBadgeProps {
  symbol?: string;
  size?: number;
  gradient?: string;
}

export default function Floating3DBadge({
  symbol = '₹',
  size = 48,
  gradient = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
}: Floating3DBadgeProps) {
  return (
    <motion.div
      animate={{
        y: [0, -6, 0],
        rotateX: [0, 8, 0],
        rotateY: [0, -8, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '1rem',
        background: gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontWeight: 800,
        fontSize: `${size * 0.45}px`,
        boxShadow: '0 12px 24px -6px rgba(16, 185, 129, 0.45), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
        transformStyle: 'preserve-3d',
        transform: 'translateZ(40px)',
        userSelect: 'none'
      }}
    >
      {symbol}
    </motion.div>
  );
}
