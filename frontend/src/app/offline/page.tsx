'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RefreshCw, Home } from 'lucide-react';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '65vh',
      textAlign: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '1.25rem',
        padding: '3rem 2rem',
        maxWidth: '480px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}>
          <WifiOff size={36} color="#ef4444" />
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#f8fafc',
          marginBottom: '0.75rem',
          letterSpacing: '-0.02em'
        }}>
          You are Offline
        </h1>

        <p style={{
          color: '#94a3b8',
          fontSize: '0.975rem',
          lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          FinTrack cannot reach the server right now. Check your internet connection or retry once connected.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleReload}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#10b981',
              color: '#ffffff',
              fontWeight: 600,
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'background 0.2s ease'
            }}
          >
            <RefreshCw size={18} />
            Try Reconnecting
          </button>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#e2e8f0',
              fontWeight: 600,
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            <Home size={18} />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
