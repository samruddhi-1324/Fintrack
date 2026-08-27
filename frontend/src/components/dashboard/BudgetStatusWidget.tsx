'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Card3D from '../ui/Card3D';
import Badge from '../ui/Badge';
import { BudgetStatus } from '../../types/budget';
import { formatCurrency } from '../../lib/formatters';

interface BudgetStatusWidgetProps {
  budgetStatus: BudgetStatus;
}

export default function BudgetStatusWidget({ budgetStatus }: BudgetStatusWidgetProps) {
  const percentage = Math.min(budgetStatus.percentage_used, 100);
  const statusColor =
    budgetStatus.status === 'over_budget'
      ? 'var(--accent-danger)'
      : budgetStatus.status === 'near_limit'
      ? 'var(--accent-warning)'
      : 'var(--accent-success)';

  return (
    <Card3D depth={30}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Live Monthly Budget Status
        </span>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
          <Badge variant={budgetStatus.status}>
            {budgetStatus.status.replace('_', ' ')}
          </Badge>
        </motion.div>
      </div>

      <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {formatCurrency(budgetStatus.remaining)}{' '}
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>left</span>
      </div>

      <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden', position: 'relative' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: '100%',
            backgroundColor: statusColor,
            borderRadius: 'var(--radius-full)',
            boxShadow: `0 0 12px ${statusColor}80`
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span>Spent: {formatCurrency(budgetStatus.total_spent)}</span>
        <span>Goal: {formatCurrency(budgetStatus.total_budget)}</span>
      </div>
    </Card3D>
  );
}
