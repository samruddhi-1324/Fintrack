'use client';

import React from 'react';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';

interface SummaryCardsProps {
  totalOverall: number;
  totalMonth: number;
}

export default function SummaryCards({ totalOverall, totalMonth }: SummaryCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
      <Card>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Current Month Spending
        </span>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '0.375rem' }}>
          {formatCurrency(totalMonth)}
        </div>
      </Card>

      <Card>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Total Historical Spending
        </span>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.375rem' }}>
          {formatCurrency(totalOverall)}
        </div>
      </Card>
    </div>
  );
}
