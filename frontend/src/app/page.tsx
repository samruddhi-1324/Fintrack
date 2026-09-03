'use client';

import React from 'react';
import SummaryCards from '../components/dashboard/SummaryCards';
import BudgetStatusWidget from '../components/dashboard/BudgetStatusWidget';
import DailyLimitWidget from '../components/dashboard/DailyLimitWidget';
import PaymentMethodBreakdownWidget from '../components/dashboard/PaymentMethodBreakdownWidget';
import RecentExpensesSnapshot from '../components/dashboard/RecentExpensesSnapshot';
import MoMComparisonWidget from '../components/dashboard/MoMComparisonWidget';
import { AIInsightsWidget } from '../components/ai/AIInsightsWidget';
import { AIForecastWidget } from '../components/ai/AIForecastWidget';
import { FinancialHealthScoreWidget } from '../components/ai/FinancialHealthScoreWidget';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardPage() {
  const { summary, mom, isLoading, isError } = useDashboard();

  return (
    <ProtectedRoute>
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {isLoading ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading your financial dashboard...
          </div>
        ) : isError || !summary ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--accent-danger)' }}>
            Failed to load dashboard data. Please ensure the backend API server is running.
          </div>
        ) : (
          <>
            {/* AI Insights & Emotional Sentiment Widget */}
            <AIInsightsWidget />

            {/* AI Financial Health Score (0-100) */}
            <FinancialHealthScoreWidget />

            {/* AI Predictive Expense Forecast Widget */}
            <AIForecastWidget />

            {/* Daily Spending Limit Widget */}
            <DailyLimitWidget dailyStatus={summary.daily_limit_status} />

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

            {/* Payment Method Breakdown Widget */}
            <PaymentMethodBreakdownWidget data={summary.payment_mode_breakdown} />

            {/* Recent Expenses Snapshot */}
            <RecentExpensesSnapshot expenses={summary.recent_expenses} />
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}
