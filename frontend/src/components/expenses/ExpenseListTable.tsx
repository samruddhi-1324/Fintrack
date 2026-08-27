'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Expense } from '../../types/expense';
import { formatCurrency, formatDate } from '../../lib/formatters';

interface ExpenseListTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export default function ExpenseListTable({ expenses, onEdit, onDelete }: ExpenseListTableProps) {
  if (expenses.length === 0) {
    return (
      <Card style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          No expenses found matching your criteria. Add a new expense to start tracking!
        </p>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Title / Merchant</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>Payment Mode</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600, textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '0.875rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {expenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                  style={{
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                    {formatDate(expense.date)}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>
                    <div>{expense.title}</div>
                    {expense.notes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                        {expense.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Badge variant="info">{(expense as any).category_name || 'Category'}</Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textTransform: 'uppercase' }}>
                    {expense.payment_mode ? <Badge>{expense.payment_mode}</Badge> : '-'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700, fontSize: '0.9375rem' }}>
                    {formatCurrency(expense.amount)}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Button size="sm" variant="secondary" onClick={() => onEdit(expense)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => onDelete(expense)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
