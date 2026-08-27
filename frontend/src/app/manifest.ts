import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinTrack — Personal Expense Tracker',
    short_name: 'FinTrack',
    description: 'Track daily expenses, categorize spending, analyze charts, and manage your budget live in INR (₹).',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-48.png?v=3',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-72.png?v=3',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-96.png?v=3',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-128.png?v=3',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-144.png?v=3',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192.png?v=3',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192-maskable.png?v=3',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-384.png?v=3',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512.png?v=3',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512-maskable.png?v=3',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    shortcuts: [
      {
        name: 'Add Expense',
        short_name: 'Add Expense',
        description: 'Quickly record a new expense',
        url: '/expenses',
        icons: [{ src: '/icons/icon-192.png?v=3', sizes: '192x192' }]
      },
      {
        name: 'View Analytics',
        short_name: 'Analytics',
        description: 'Check spending breakdown charts',
        url: '/budgets',
        icons: [{ src: '/icons/icon-192.png?v=3', sizes: '192x192' }]
      }
    ]
  };
}

