'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../../services/aiApi';
import { Sparkles, Calendar, TrendingUp, AlertTriangle, ShieldCheck, Flame, Zap, RefreshCw, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

export const AIForecastWidget: React.FC = () => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['ai-forecast'],
    queryFn: () => aiApi.getForecast(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  if (isLoading) {
    return (
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          opacity: 0.7
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Predicting month-end run rate & burn pace with AI...
          </span>
          <RefreshCw className="animate-spin" size={16} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={20} style={{ color: 'var(--accent-danger)' }} />
          <div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>
              AI Predictive Expense Forecast
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Could not calculate expense forecast. Click recalculate to retry.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          style={{
            padding: '0.4rem 0.85rem',
            backgroundColor: 'var(--accent-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Recalculate Forecast
        </button>
      </div>
    );
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(185, 28, 28, 0.12) 100%)';
      case 'caution':
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.08) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)';
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'critical':
        return '1px solid rgba(239, 68, 68, 0.45)';
      case 'caution':
        return '1px solid rgba(245, 158, 11, 0.45)';
      default:
        return '1px solid rgba(16, 185, 129, 0.45)';
    }
  };

  const projectedPct = data.total_monthly_budget > 0
    ? Math.min(Math.round((data.projected_month_end_spend / data.total_monthly_budget) * 100), 150)
    : 0;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.35)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.5rem',
              backgroundColor: '#a855f7',
              borderRadius: 'var(--radius-md)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                AI Predictive Expense Forecast
              </h3>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  color: '#d8b4fe',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {data.provider === 'gemini' ? 'Gemini 1.5' : data.provider}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Pace forecasting & daily safe spending limits for Day {data.days_elapsed} of {data.total_days_in_month}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.4rem 0.75rem',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Forecasting...' : 'Recalculate'}
        </button>
      </div>

      {/* 🔮 Predictive Alert & Advice Banner */}
      <div
        style={{
          background: getStatusBg(data.forecast_status),
          border: getStatusBorder(data.forecast_status),
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.25rem', lineHeight: 1 }}>
            {data.forecast_emoji}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {data.forecast_headline}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: data.forecast_status === 'critical' ? '#fca5a5' : data.forecast_status === 'safe' ? '#86efac' : '#fde047',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                {data.days_remaining} Days Remaining
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: '0.35rem 0 0 0', lineHeight: 1.45 }}>
              {data.forecast_advice}
            </p>
          </div>
        </div>

        {data.predicted_budget_exhaustion_day && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Predicted Exhaustion</span>
            <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--accent-danger)' }}>
              Day {data.predicted_budget_exhaustion_day}
            </span>
          </div>
        )}
      </div>

      {/* Forecast Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '0.875rem' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <TrendingUp size={14} style={{ color: '#a855f7' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Projected Month-End</span>
          </div>
          <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatCurrency(data.projected_month_end_spend)}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
            Current: {formatCurrency(data.current_spend)}
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <Flame size={14} style={{ color: 'var(--accent-warning)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Daily Burn Pace</span>
          </div>
          <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
            {formatCurrency(data.daily_burn_rate)}<span style={{ fontSize: '0.8125rem', fontWeight: 400 }}>/day</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
            Over {data.days_elapsed} days elapsed
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent-success)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Recommended Daily Cap</span>
          </div>
          <span style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--accent-success)' }}>
            {formatCurrency(data.recommended_safe_daily_spend)}<span style={{ fontSize: '0.8125rem', fontWeight: 400 }}>/day</span>
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.2rem' }}>
            To stay under monthly goal
          </span>
        </div>
      </div>

      {/* Projected Budget Bar */}
      {data.total_monthly_budget > 0 && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Month-End Projection vs Budget ({projectedPct}%)
            </span>
            <span style={{ color: data.projected_variance >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 700 }}>
              {data.projected_variance >= 0 ? `+${formatCurrency(data.projected_variance)} Surplus` : `${formatCurrency(Math.abs(data.projected_variance))} Deficit`}
            </span>
          </div>

          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(projectedPct, 100)}%`,
                height: '100%',
                backgroundColor: projectedPct > 100 ? 'var(--accent-danger)' : projectedPct >= 85 ? 'var(--accent-warning)' : 'var(--accent-success)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Target Goal: {formatCurrency(data.total_monthly_budget)}</span>
            <span>Projected: {formatCurrency(data.projected_month_end_spend)}</span>
          </div>
        </div>
      )}

      {/* Category Month-End Run Rates */}
      {data.category_forecasts && data.category_forecasts.length > 0 && (
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a855f7', display: 'block', marginBottom: '0.75rem' }}>
            🔮 Category Month-End Projected Spend
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {data.category_forecasts.map((cat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {cat.emoji} {cat.category}
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: cat.status === 'over_budget' ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                    {formatCurrency(cat.projected_month_end)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                  <span>Pace: {formatCurrency(cat.daily_burn_rate)}/day</span>
                  <span>Spent: {formatCurrency(cat.current_spent)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
