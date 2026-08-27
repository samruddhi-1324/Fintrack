'use client';

import React from 'react';
import Card3D from '../ui/Card3D';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Budget } from '../../types/budget';
import { formatCurrency } from '../../lib/formatters';

interface BudgetCardListProps {
  budgets: Budget[];
  onDelete: (id: string) => void;
}

export default function BudgetCardList({ budgets, onDelete }: BudgetCardListProps) {
  if (budgets.length === 0) {
    return (
      <Card3D depth={25} style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          No budget limits configured yet. Set an overall, category, or daily spending goal!
        </p>
      </Card3D>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
      {budgets.map((budget) => (
        <Card3D key={budget.id} depth={30} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                {(budget as any).category_name || (budget.period === 'daily' ? 'Daily Spending Limit' : 'Overall Monthly Budget')}
              </h3>
              <Badge variant={budget.period === 'daily' ? 'near_limit' : 'info'}>
                {budget.period === 'daily' ? 'Daily Cap' : 'Monthly'}
              </Badge>
            </div>

            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {formatCurrency(budget.amount)}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="sm" variant="danger" onClick={() => onDelete(budget.id)}>
              Remove Goal
            </Button>
          </div>
        </Card3D>
      ))}
    </div>
  );
}
