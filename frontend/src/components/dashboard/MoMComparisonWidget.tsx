'use client';

import React from 'react';
import Card3D from '../ui/Card3D';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../lib/formatters';

interface MoMComparisonWidgetProps {
  momData: {
    current_month_spent: number;
    previous_month_spent: number;
    difference: number;
    percentage_change: number;
  } | undefined;
}

export default function MoMComparisonWidget({ momData }: MoMComparisonWidgetProps) {
  if (!momData) return null;

  const isHigher = momData.percentage_change > 0;
  const isLower = momData.percentage_change < 0;

  return (
    <Card3D depth={30}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Month-over-Month Spending Comparison
        </span>
        <Badge variant={isHigher ? 'over_budget' : isLower ? 'on_track' : 'default'}>
          {isHigher ? `+${momData.percentage_change}%` : `${momData.percentage_change}%`}
        </Badge>
      </div>

      <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.25rem' }}>
        {formatCurrency(momData.current_month_spent)}{' '}
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
          vs {formatCurrency(momData.previous_month_spent)} last month
        </span>
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
        {isHigher
          ? `You have spent ${formatCurrency(momData.difference)} more than last month.`
          : isLower
          ? `You have saved ${formatCurrency(Math.abs(momData.difference))} compared to last month!`
          : `Your spending is equal to last month.`}
      </p>
    </Card3D>
  );
}
