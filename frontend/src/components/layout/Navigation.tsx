'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Expenses', path: '/expenses' },
    { label: 'Categories', path: '/categories' },
    { label: 'Budgets', path: '/budgets' }
  ];

  return (
    <nav
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 1.5rem',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          width: '100%',
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto'
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              style={{
                padding: '0.875rem 0.25rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                position: 'relative',
                transition: 'color 0.2s ease',
                whiteSpace: 'nowrap',
                textDecoration: 'none'
              }}
            >
              <motion.span whileHover={{ y: -1 }} transition={{ type: 'spring', stiffness: 400 }}>
                {item.label}
              </motion.span>

              {isActive && (
                <motion.div
                  layoutId="activeNavPill"
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--accent-primary)',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
