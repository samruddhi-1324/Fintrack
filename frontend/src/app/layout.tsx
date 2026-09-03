import React from 'react';
import type { Metadata, Viewport } from 'next';
import Providers from './providers';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import PWARegister from '../components/pwa/PWARegister';
import PWAInstallPrompt from '../components/pwa/PWAInstallPrompt';
import { AICopilotDrawer } from '../components/ai/AICopilotDrawer';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'FinTrack — Personal Expense Tracker',
  description: 'Track daily expenses, categorize spending, analyze charts, and manage your budget live.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FinTrack'
  },
  applicationName: 'FinTrack',
  icons: {
    icon: [
      { url: '/favicon.ico?v=3' },
      { url: '/icons/icon-192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png?v=3', sizes: '512x512', type: 'image/png' }
    ],
    shortcut: '/icons/icon-192.png?v=3',
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      {
        rel: 'android-touch-icon',
        url: '/icons/icon-192.png?v=3'
      },
      {
        rel: 'mask-icon',
        url: '/icons/icon-512-maskable.png?v=3',
        color: '#0f172a'
      }
    ]
  },
  other: {
    'mobile-web-app-capable': 'yes'
  }
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
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
          <PWARegister />
          <PWAInstallPrompt />
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Navigation />
            <div style={{ flex: 1, padding: '1.5rem 1rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
              {children}
            </div>
          </div>
          <AICopilotDrawer />
        </Providers>
      </body>
    </html>
  );
}


