'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
                borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                transition: 'all 0.15s ease-in-out',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
