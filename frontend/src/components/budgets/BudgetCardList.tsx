'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Card3D from '../ui/Card3D';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Budget } from '../../types/budget';
import { budgetApi } from '../../services/budgetApi';
import { formatCurrency } from '../../lib/formatters';

interface BudgetCardListProps {
  budgets: Budget[];
  onDelete: (id: string) => void;
}

const CategoryBudgetCard: React.FC<{ budget: Budget; onDelete: (id: string) => void }> = ({ budget, onDelete }) => {
  const { data: status } = useQuery({
    queryKey: ['budget-status-card', budget.category_id, budget.id],
    queryFn: () => budgetApi.getBudgetStatus(budget.category_id || undefined),
    staleTime: 1000 * 30 // 30s cache
  });

  const percent = status ? Math.min(status.percentage_used, 100) : 0;
  const badgeVariant = status ? status.status : (budget.period === 'daily' ? 'near_limit' : 'info');

  return (
    <Card3D depth={30} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>
            {(budget as any).category_name || (budget.period === 'daily' ? 'Daily Spending Limit' : 'Overall Monthly Budget')}
          </h3>
          <Badge variant={badgeVariant}>
            {status ? (
              status.status === 'over_budget'
                ? `😱 Over Budget (${status.percentage_used}%) 💸`
                : status.status === 'near_limit'
                ? `😬 Near Limit (${status.percentage_used}%) ⚠️`
                : `🥳 On Track (${status.percentage_used}%) 💰`
            ) : (
              budget.period === 'daily' ? '⚡ Daily Cap' : '🎯 Monthly Goal'
            )}
          </Badge>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {formatCurrency(budget.amount)}
          </span>
          {status && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {status.remaining >= 0 ? `${formatCurrency(status.remaining)} left` : `${formatCurrency(Math.abs(status.remaining))} over`}
            </span>
          )}
        </div>

        {/* Live Progress Bar */}
        {status && (
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '0.5rem' }}>
            <div
              style={{
                width: `${percent}%`,
                height: '100%',
                backgroundColor:
                  status.status === 'over_budget'
                    ? 'var(--accent-danger)'
                    : status.status === 'near_limit'
                    ? 'var(--accent-warning)'
                    : 'var(--accent-success)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        )}

        {status && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Spent: {formatCurrency(status.total_spent)}</span>
            <span>Limit: {formatCurrency(status.total_budget)}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <Button size="sm" variant="danger" onClick={() => onDelete(budget.id)}>
          Remove Goal
        </Button>
      </div>
    </Card3D>
  );
};

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
        <CategoryBudgetCard key={budget.id} budget={budget} onDelete={onDelete} />
      ))}
    </div>
  );
}
