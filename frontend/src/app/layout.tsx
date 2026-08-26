import React from 'react';
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
        <div id="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}
