'use client';

import React from 'react';
import Card3D from '../ui/Card3D';
import Floating3DBadge from '../ui/Floating3DBadge';
import { formatCurrency } from '../../lib/formatters';

interface SummaryCardsProps {
  totalOverall: number;
  totalMonth: number;
}

export default function SummaryCards({ totalOverall, totalMonth }: SummaryCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      <Card3D depth={35}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Current Month Spending
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
              {formatCurrency(totalMonth)}
            </div>
          </div>
          <Floating3DBadge symbol="₹" size={52} gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" />
        </div>
      </Card3D>

      <Card3D depth={35}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Historical Spending
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.4rem', letterSpacing: '-0.02em' }}>
              {formatCurrency(totalOverall)}
            </div>
          </div>
          <Floating3DBadge symbol="📊" size={52} gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" />
        </div>
      </Card3D>
    </div>
  );
}
