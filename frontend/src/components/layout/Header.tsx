'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import HamburgerMenu from './HamburgerMenu';
import ExpenseFormModal from '../expenses/ExpenseFormModal';
import Button from '../ui/Button';

export default function Header() {
  const { user, isAuthenticated, logout, logoutAll } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <header
        style={{
          backgroundColor: 'var(--bg-secondary, #1e293b)',
          borderBottom: '1px solid var(--border-color, #334155)',
          padding: '0.875rem 1.5rem',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Brand Logo / Name */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <img
              src="/icons/icon-192.png?v=3"
              alt="FinTrack Logo"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                objectFit: 'contain',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)'
              }}
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-primary, #f8fafc)' }}>
              FinTrack
            </span>
          </Link>

          {/* Action & User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <>
                <Button size="sm" onClick={() => setIsAddExpenseOpen(true)}>
                  + Add Expense
                </Button>

                {/* User Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color, #334155)',
                      borderRadius: '20px',
                      padding: '4px 12px 4px 6px',
                      color: '#f8fafc',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="Avatar"
                        style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                      />
                    ) : (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}>
                        {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.full_name || user?.email?.split('@')[0]}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>▼</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: '120%',
                      width: '220px',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                      padding: '8px 0',
                      zIndex: 100
                    }}>
                      <div style={{ padding: '8px 16px 12px 16px', borderBottom: '1px solid #334155' }}>
                        <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.full_name || 'User'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user?.email}
                        </div>
                      </div>

                      <button
                        onClick={() => { setIsDropdownOpen(false); logout(); }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 16px',
                          background: 'none',
                          border: 'none',
                          color: '#f8fafc',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        🚪 Sign Out
                      </button>

                      <button
                        onClick={() => { setIsDropdownOpen(false); logoutAll(); }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '10px 16px',
                          background: 'none',
                          border: 'none',
                          color: '#fca5a5',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        🔒 Sign Out All Devices
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  textDecoration: 'none'
                }}
              >
                Sign In
              </Link>
            )}

            {/* Hamburger Button for Navigation */}
            <button
              onClick={() => setIsMenuOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--bg-card, #0f172a)',
                border: '1px solid var(--border-color, #334155)',
                borderRadius: '8px',
                color: 'var(--text-primary, #f8fafc)',
                fontSize: '1.25rem',
                cursor: 'pointer'
              }}
              aria-label="Toggle Menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Add Expense Modal */}
      <ExpenseFormModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />
    </>
  );
}
