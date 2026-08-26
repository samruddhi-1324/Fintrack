'use client';

import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { BudgetStatus } from '../../types/budget';
import { formatCurrency } from '../../lib/formatters';

interface BudgetStatusWidgetProps {
  budgetStatus: BudgetStatus;
}

export default function BudgetStatusWidget({ budgetStatus }: BudgetStatusWidgetProps) {
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Live Monthly Budget Status
        </span>
        <Badge variant={budgetStatus.status}>
          {budgetStatus.status.replace('_', ' ')}
        </Badge>
      </div>

      <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {formatCurrency(budgetStatus.remaining)}{' '}
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>left</span>
      </div>

      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.min(budgetStatus.percentage_used, 100)}%`,
            height: '100%',
            backgroundColor:
              budgetStatus.status === 'over_budget'
                ? 'var(--accent-danger)'
                : budgetStatus.status === 'near_limit'
                ? 'var(--accent-warning)'
                : 'var(--accent-success)',
            transition: 'width 0.4s ease'
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span>Spent: {formatCurrency(budgetStatus.total_spent)}</span>
        <span>Goal: {formatCurrency(budgetStatus.total_budget)}</span>
      </div>
    </Card>
  );
}
