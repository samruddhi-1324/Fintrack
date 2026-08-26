'use client';

import React from 'react';
import SummaryCards from '../components/dashboard/SummaryCards';
import BudgetStatusWidget from '../components/dashboard/BudgetStatusWidget';
import CategoryPieChart from '../components/dashboard/CategoryPieChart';
import SpendingTrendChart from '../components/dashboard/SpendingTrendChart';
import RecentExpensesSnapshot from '../components/dashboard/RecentExpensesSnapshot';
import MoMComparisonWidget from '../components/dashboard/MoMComparisonWidget';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardPage() {
  const { summary, mom, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <main style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading your financial dashboard...
      </main>
    );
  }

  if (isError || !summary) {
    return (
      <main style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--accent-danger)' }}>
        Failed to load dashboard data. Please ensure the backend API server is running on <code>http://localhost:8000</code>.
      </main>
    );
  }

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Metric Cards */}
      <SummaryCards
        totalOverall={summary.total_spent_overall}
        totalMonth={summary.total_spent_current_month}
      />

      {/* Budget Status & MoM Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <BudgetStatusWidget budgetStatus={summary.budget_status} />
        <MoMComparisonWidget momData={mom} />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        <CategoryPieChart data={summary.category_breakdown} />
        <SpendingTrendChart data={summary.spending_trend} />
      </div>

      {/* Recent Expenses Snapshot */}
      <RecentExpensesSnapshot expenses={summary.recent_expenses} />
    </main>
  );
}
