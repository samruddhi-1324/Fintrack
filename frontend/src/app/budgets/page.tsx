'use client';

import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import BudgetFormModal from '../../components/budgets/BudgetFormModal';
import BudgetCardList from '../../components/budgets/BudgetCardList';
import { useBudgets } from '../../hooks/useBudgets';
import { formatCurrency } from '../../lib/formatters';

export default function BudgetsPage() {
  const { budgets, budgetStatus, isLoading, isError, deleteBudget } = useBudgets();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Live Budget Tracking</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Set spending goals and track your remaining balance in real-time
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          + Set Budget Goal
        </Button>
      </div>

      {/* Live Overall Budget Summary Status Card */}
      {budgetStatus && (
        <Card style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Overall Monthly Budget Status</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '0.25rem' }}>
                {formatCurrency(budgetStatus.remaining)} <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 400 }}>remaining</span>
              </div>
            </div>
            <Badge variant={budgetStatus.status}>
              {budgetStatus.status.replace('_', ' ')} ({budgetStatus.percentage_used}%)
            </Badge>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <span>Spent: {formatCurrency(budgetStatus.total_spent)}</span>
            <span>Target Goal: {formatCurrency(budgetStatus.total_budget)}</span>
          </div>
        </Card>
      )}

      {/* Configured Budget Cards List */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Configured Spending Goals</h2>
        {isLoading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading budgets...</p>
        ) : isError ? (
          <p style={{ color: 'var(--accent-danger)' }}>Failed to load budgets. Check backend connection.</p>
        ) : (
          <BudgetCardList budgets={budgets} onDelete={(id) => deleteBudget(id)} />
        )}
      </div>

      {/* Set Budget Form Modal */}
      <BudgetFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
