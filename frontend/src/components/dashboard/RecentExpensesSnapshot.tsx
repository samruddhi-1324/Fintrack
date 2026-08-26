'use client';

import React from 'react';
import Link from 'next/link';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Expense } from '../../types/expense';
import { formatCurrency, formatDate } from '../../lib/formatters';

interface RecentExpensesSnapshotProps {
  expenses: Expense[];
}

export default function RecentExpensesSnapshot({ expenses }: RecentExpensesSnapshotProps) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Expenses</h3>
        <Link href="/expenses" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
          View All &rarr;
        </Link>
      </div>

      {expenses.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
          No recent transactions logged yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {expenses.map((exp) => (
            <div
              key={exp.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.625rem 0.75rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{exp.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.125rem' }}>
                  {formatDate(exp.date)} &bull; <Badge variant="info">{(exp as any).category_name || 'Category'}</Badge>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {formatCurrency(exp.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
