'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import DailyLimitModal from '../budgets/DailyLimitModal';
import { DailyLimitStatus } from '../../types/budget';
import { formatCurrency } from '../../lib/formatters';

interface DailyLimitWidgetProps {
  dailyStatus?: DailyLimitStatus;
}

export default function DailyLimitWidget({ dailyStatus }: DailyLimitWidgetProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!dailyStatus) return null;

  const hasLimit = dailyStatus.daily_limit > 0;
  const percentage = hasLimit ? Math.min(dailyStatus.percentage_used, 100) : 0;
  const isOver = dailyStatus.status === 'over_budget';
  const isNear = dailyStatus.status === 'near_limit';

  const statusColor = isOver
    ? 'var(--accent-danger)'
    : isNear
    ? 'var(--accent-warning)'
    : 'var(--accent-success)';

  return (
    <>
      <Card style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>⚡</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Daily Spending Limit
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {hasLimit && (
              <Badge variant={dailyStatus.status}>
                {dailyStatus.status.replace('_', ' ')} ({dailyStatus.percentage_used}%)
              </Badge>
            )}
            <Button size="sm" variant="secondary" onClick={() => setIsModalOpen(true)}>
              {hasLimit ? 'Edit Limit' : '+ Set Limit'}
            </Button>
          </div>
        </div>

        {hasLimit ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Today's Remaining Cap</span>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: isOver ? 'var(--accent-danger)' : 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {formatCurrency(dailyStatus.remaining)}{' '}
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                    {isOver ? 'over limit' : 'left today'}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <div>Spent Today: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(dailyStatus.today_spent)}</strong></div>
                <div>Target Cap: <strong>{formatCurrency(dailyStatus.daily_limit)}</strong></div>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '0.75rem' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: '100%',
                  backgroundColor: statusColor,
                  borderRadius: 'var(--radius-full)',
                  boxShadow: `0 0 12px ${statusColor}80`
                }}
              />
            </div>

            {isOver && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--accent-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--accent-danger)', fontWeight: 500 }}>
                ⚠️ <strong>Limit Exceeded!</strong> You have spent {formatCurrency(dailyStatus.today_spent)} today, exceeding your ₹{dailyStatus.daily_limit} daily target.
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '0.75rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              No daily spending cap configured. Set a daily limit to track real-time daily spending.
            </span>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              Set Daily Limit Now
            </Button>
          </div>
        )}
      </Card>

      <DailyLimitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLimit={dailyStatus.daily_limit}
      />
    </>
  );
}
