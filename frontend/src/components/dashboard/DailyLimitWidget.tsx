'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Badge from '../ui/Badge';
import DailyLimitModal from '../budgets/DailyLimitModal';
import { DailyLimitStatus } from '../../types/budget';
import { formatCurrency } from '../../lib/formatters';
import { Zap, Edit2, Plus, AlertTriangle, ShieldCheck } from 'lucide-react';

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
      <div
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div
              style={{
                padding: '0.45rem',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
                Daily Spending Limit
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Real-time today's expenditure tracker
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {hasLimit && (
              <Badge variant={dailyStatus.status}>
                {isOver ? '😱 Over Limit' : isNear ? '😬 Near Limit' : '🥳 On Track'} ({dailyStatus.percentage_used}%)
              </Badge>
            )}

            {/* Direct Action Button */}
            <button
              type="button"
              id="set-daily-limit-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.45rem 0.875rem',
                backgroundColor: hasLimit ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                color: hasLimit ? 'var(--text-primary)' : '#ffffff',
                border: hasLimit ? '1px solid var(--border-color)' : 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: hasLimit ? 'none' : '0 2px 8px rgba(99, 102, 241, 0.35)',
                transition: 'all 0.2s ease',
                position: 'relative',
                zIndex: 10
              }}
            >
              {hasLimit ? (
                <>
                  <Edit2 size={13} /> Edit Daily Limit
                </>
              ) : (
                <>
                  <Plus size={14} /> + Set Daily Limit
                </>
              )}
            </button>
          </div>
        </div>

        {hasLimit ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Today's Remaining Cap</span>
                <div style={{ fontSize: '1.625rem', fontWeight: 800, color: isOver ? 'var(--accent-danger)' : 'var(--text-primary)', marginTop: '0.15rem' }}>
                  {formatCurrency(dailyStatus.remaining)}{' '}
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                    {isOver ? 'over limit today' : 'remaining today'}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <div>Spent Today: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(dailyStatus.today_spent)}</strong></div>
                <div>Target Cap: <strong style={{ color: 'var(--accent-warning)' }}>{formatCurrency(dailyStatus.daily_limit)}</strong></div>
              </div>
            </div>

            {/* Dynamic Progress Bar */}
            <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '0.5rem' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: '100%',
                  backgroundColor: statusColor,
                  borderRadius: 'var(--radius-full)'
                }}
              />
            </div>

            {isOver && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid var(--accent-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--accent-danger)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Daily Limit Exceeded!</strong> You have spent {formatCurrency(dailyStatus.today_spent)} today, exceeding your ₹{dailyStatus.daily_limit} target.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              No daily spending cap configured yet. Set a daily target (e.g. ₹500/day) to track today's spending live!
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--accent-primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)'
              }}
            >
              <Zap size={14} /> Set Daily Limit Now
            </button>
          </div>
        )}
      </div>

      <DailyLimitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentLimit={dailyStatus.daily_limit}
      />
    </>
  );
}
