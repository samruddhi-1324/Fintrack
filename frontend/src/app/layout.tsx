import React from 'react';
import Providers from './providers';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import '../styles/globals.css';

export const metadata = {
  title: 'FinTrack — Personal Expense Tracker',
  description: 'Track daily expenses, categorize spending, analyze charts, and manage your budget live.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Navigation />
            <div style={{ flex: 1, padding: '1.5rem 1rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
