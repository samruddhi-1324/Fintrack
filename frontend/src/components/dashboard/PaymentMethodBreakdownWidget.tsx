'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Card3D from '../ui/Card3D';
import Floating3DBadge from '../ui/Floating3DBadge';
import { PaymentModeSpendSummary } from '../../services/dashboardApi';
import { formatCurrency } from '../../lib/formatters';

interface PaymentMethodBreakdownWidgetProps {
  data?: PaymentModeSpendSummary[];
}

const modeConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  upi: {
    label: 'UPI Payments',
    icon: '📱',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)'
  },
  card: {
    label: 'Card / NetBanking',
    icon: '💳',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.15)'
  },
  cash: {
    label: 'Cash In Hand',
    icon: '💵',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)'
  },
  unspecified: {
    label: 'Other / Unspecified',
    icon: '❓',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.15)'
  }
};

export default function PaymentMethodBreakdownWidget({ data = [] }: PaymentMethodBreakdownWidgetProps) {
  if (!data || data.length === 0) {
    return (
      <Card3D depth={30} style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Payment Method Breakdown</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No payment mode expense data recorded yet.</p>
      </Card3D>
    );
  }

  const totalSpending = data.reduce((acc, curr) => acc + curr.total_amount, 0);

  return (
    <Card3D depth={30} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Payment Method Breakdown</h3>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Distribution of spending by payment mode</span>
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent-primary)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)' }}>
          {formatCurrency(totalSpending)} Total
        </span>
      </div>

      {/* Multi-Segment Stacked Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '14px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: '1.25rem'
        }}
      >
        {data.map((item) => {
          const cfg = modeConfig[item.payment_mode.toLowerCase()] || modeConfig.unspecified;
          const pct = item.percentage > 0 ? item.percentage : 0;
          return (
            <motion.div
              key={item.payment_mode}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                height: '100%',
                backgroundColor: cfg.color,
                boxShadow: `0 0 10px ${cfg.color}80`
              }}
              title={`${cfg.label}: ${formatCurrency(item.total_amount)} (${item.percentage}%)`}
            />
          );
        })}
      </div>

      {/* Grid List of Payment Modes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1 }}>
        {data.map((item) => {
          const modeKey = item.payment_mode.toLowerCase();
          const cfg = modeConfig[modeKey] || modeConfig.unspecified;

          return (
            <div
              key={item.payment_mode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.875rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: cfg.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.125rem'
                  }}
                >
                  {cfg.icon}
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cfg.label}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {item.transaction_count} transaction{item.transaction_count === 1 ? '' : 's'}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency(item.total_amount)}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: cfg.color
                  }}
                >
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card3D>
  );
}
