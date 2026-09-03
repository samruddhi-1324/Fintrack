'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import BudgetFormModal from '../../components/budgets/BudgetFormModal';
import BudgetCardList from '../../components/budgets/BudgetCardList';
import DailyLimitWidget from '../../components/dashboard/DailyLimitWidget';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useBudgets } from '../../hooks/useBudgets';
import { useCategories } from '../../hooks/useCategories';
import { aiApi } from '../../services/aiApi';
import { formatCurrency } from '../../lib/formatters';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';

export default function BudgetsPage() {
  const { budgets, budgetStatus, dailyStatus, isLoading, isError, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryPrefill, setSelectedCategoryPrefill] = useState<{ categoryId?: string; amount?: number }>({});

  const { data: aiData } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiApi.getInsights(),
    staleTime: 1000 * 60 * 5
  });

  const handleApplyAiRecommendation = (categoryName: string, recommendedAmount: number) => {
    const catLower = (categoryName || '').toLowerCase().trim();
    let matched = categories.find((c) => c.name.toLowerCase().trim() === catLower);
    if (!matched) {
      matched = categories.find((c) => {
        const nameLower = c.name.toLowerCase().trim();
        return (
          nameLower.includes(catLower) ||
          catLower.includes(nameLower) ||
          (catLower.startsWith('transport') && nameLower.startsWith('transport')) ||
          (catLower.startsWith('food') && nameLower.startsWith('food')) ||
          (catLower.startsWith('util') && nameLower.startsWith('util')) ||
          (catLower.startsWith('entertain') && nameLower.startsWith('entertain'))
        );
      });
    }

    setSelectedCategoryPrefill({
      categoryId: matched ? matched.id : (categories.length > 0 ? categories[0].id : ''),
      amount: recommendedAmount
    });
    setIsModalOpen(true);
  };


  return (
    <ProtectedRoute>
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Live Budget Tracking</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Set spending goals and track your remaining balance in real-time
            </p>
          </div>
          <Button onClick={() => {
            setSelectedCategoryPrefill({});
            setIsModalOpen(true);
          }}>
            + Set Budget Goal
          </Button>
        </div>

        {/* AI Recommended Budget Targets */}
        {aiData && aiData.budget_recommendations && aiData.budget_recommendations.length > 0 && (
          <div
            style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.08))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.375rem', backgroundColor: 'var(--accent-primary)', borderRadius: 'var(--radius-md)', color: '#fff' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    AI Recommended Budget Limits
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Calculated from your authentic monthly category spending trends
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {aiData.budget_recommendations.map((rec, idx) => {
                const spent = rec.current_spent || 0;
                const limit = rec.recommended_budget || 1000;
                const pct = limit > 0 ? Math.min(Math.round((spent / limit) * 100), 100) : 0;
                const remaining = limit - spent;

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      borderRadius: 'var(--radius-xl)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                      transition: 'transform 0.2s ease, border-color 0.2s ease'
                    }}
                  >
                    <div>
                      {/* Card Header: Category & Badge */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                          {rec.category}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'rgba(99, 102, 241, 0.2)',
                            color: 'var(--accent-primary)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}
                        >
                          <Sparkles size={12} /> AI Recommended
                        </span>
                      </div>

                      {/* Spend & Recommended Target */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Target Limit</span>
                          <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                            {formatCurrency(rec.recommended_budget)}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Current Spend</span>
                          <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {formatCurrency(spent)}
                          </span>
                        </div>
                      </div>

                      {/* AI Budget Progress Bar */}
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden', margin: '0.625rem 0' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: pct >= 100 ? 'var(--accent-danger)' : pct >= 80 ? 'var(--accent-warning)' : 'var(--accent-success)',
                            transition: 'width 0.4s ease'
                          }}
                        />
                      </div>

                      {/* Progress Meta */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        <span>{pct}% allocated</span>
                        <span style={{ color: remaining >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 600 }}>
                          {remaining >= 0 ? `${formatCurrency(remaining)} buffer remaining` : `${formatCurrency(Math.abs(remaining))} over`}
                        </span>
                      </div>

                      {/* AI Reason Text */}
                      <p style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', lineHeight: 1.45 }}>
                        {rec.reason}
                      </p>
                    </div>

                    {/* 1-Click Apply Action Button */}
                    <button
                      type="button"
                      onClick={() => handleApplyAiRecommendation(rec.category, rec.recommended_budget)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1rem',
                        backgroundColor: 'var(--accent-primary)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
                        transition: 'opacity 0.2s ease'
                      }}
                    >
                      <Zap size={14} /> Apply Target Limit ({formatCurrency(rec.recommended_budget)}) <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Daily Spending Limit Widget */}
        <DailyLimitWidget dailyStatus={dailyStatus} />

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
                {budgetStatus.status === 'over_budget'
                  ? `😱 Over Budget (${budgetStatus.percentage_used}%) 💸`
                  : budgetStatus.status === 'near_limit'
                  ? `😬 Near Limit (${budgetStatus.percentage_used}%) ⚠️`
                  : `🥳 On Track (${budgetStatus.percentage_used}%) 💰`}
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
        <BudgetFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialCategoryId={selectedCategoryPrefill.categoryId}
          initialAmount={selectedCategoryPrefill.amount}
        />
      </main>
    </ProtectedRoute>
  );
}
