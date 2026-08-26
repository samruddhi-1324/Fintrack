import React from 'react';

export default function DashboardPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>FinTrack Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to your personal expense & budget tracker</p>
      </header>
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
        <h2>System Initialized</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Backend API status: Connects to <code>http://localhost:8000/api/v1</code>
        </p>
      </section>
    </main>
  );
}
