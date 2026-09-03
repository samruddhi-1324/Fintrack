'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../../services/aiApi';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Info, RefreshCw, Zap, HeartPulse } from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

export const AIInsightsWidget: React.FC = () => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => aiApi.getInsights(),
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
            Analyzing financial trends & emoji sentiment with AI...
          </span>
          <RefreshCw className="animate-spin" size={16} />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const sentiment = data.sentiment || {
    mood: 'cautious',
    emoji: '🧐 📊 💡',
    headline: 'Financial Health Active',
    description: 'Track daily transactions to unlock real-time financial sentiment analysis.',
    burn_rate_emoji: '🌱 Balanced'
  };

  const getSentimentBg = (mood: string) => {
    switch (mood) {
      case 'distressed':
        return 'linear-gradient(135deg, rgba(239, 68, 68, 0.22) 0%, rgba(185, 28, 28, 0.12) 100%)';
      case 'over_limit':
        return 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.1) 100%)';
      case 'cautious':
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(217, 119, 6, 0.08) 100%)';
      case 'thriving':
        return 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)';
      default:
        return 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(79, 70, 229, 0.08) 100%)';
    }
  };

  const getSentimentBorder = (mood: string) => {
    switch (mood) {
      case 'distressed':
      case 'over_limit':
        return '1px solid rgba(239, 68, 68, 0.45)';
      case 'cautious':
        return '1px solid rgba(245, 158, 11, 0.45)';
      case 'thriving':
        return '1px solid rgba(16, 185, 129, 0.45)';
      default:
        return '1px solid rgba(99, 102, 241, 0.45)';
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'danger':
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: 'var(--accent-danger)',
          icon: <AlertTriangle size={18} style={{ color: 'var(--accent-danger)', flexShrink: 0, marginTop: '2px' }} />
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          color: 'var(--accent-warning)',
          icon: <AlertTriangle size={18} style={{ color: 'var(--accent-warning)', flexShrink: 0, marginTop: '2px' }} />
        };
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: 'var(--accent-success)',
          icon: <CheckCircle2 size={18} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '2px' }} />
        };
      default:
        return {
          bg: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          color: 'var(--accent-primary)',
          icon: <Info size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '2px' }} />
        };
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
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
              backgroundColor: 'var(--accent-primary)',
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
                AI Smart Insights & Financial Sentiment
              </h3>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {data.provider === 'gemini' ? 'Gemini 1.5' : data.provider}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Real-time emotion & budget health sentiment derived from authentic transactions
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
          {isFetching ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* 🎭 FEATURE: AI Financial Mood & Emotional Sentiment Banner */}
      <div
        style={{
          background: getSentimentBg(sentiment.mood),
          border: getSentimentBorder(sentiment.mood),
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Big Emotional Emoji Avatar */}
          <div
            style={{
              fontSize: '2.5rem',
              lineHeight: 1,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
              animation: sentiment.mood === 'distressed' || sentiment.mood === 'over_limit' ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {sentiment.emoji}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {sentiment.headline}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: sentiment.mood === 'distressed' || sentiment.mood === 'over_limit' ? '#fca5a5' : sentiment.mood === 'thriving' ? '#86efac' : '#fde047',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                {sentiment.burn_rate_emoji}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: '0.3rem 0 0 0', lineHeight: 1.4 }}>
              {sentiment.description}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Sentiment State</span>
          <span
            style={{
              fontSize: '0.875rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: sentiment.mood === 'distressed' || sentiment.mood === 'over_limit' ? 'var(--accent-danger)' : sentiment.mood === 'thriving' ? 'var(--accent-success)' : 'var(--accent-warning)'
            }}
          >
            {sentiment.mood.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Metric Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.875rem 1rem'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
            Current Month Spend
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(data.summary.total_current_month)}
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.875rem 1rem'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
            Month-over-Month
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            {data.summary.month_over_month_change_pct > 0 ? (
              <>
                <TrendingUp size={16} style={{ color: 'var(--accent-danger)' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-danger)' }}>
                  +{data.summary.month_over_month_change_pct}%
                </span>
              </>
            ) : data.summary.month_over_month_change_pct < 0 ? (
              <>
                <TrendingDown size={16} style={{ color: 'var(--accent-success)' }} />
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                  {data.summary.month_over_month_change_pct}%
                </span>
              </>
            ) : (
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-secondary)' }}>0.0%</span>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.875rem 1rem'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>
            Monthly Budget Cap
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {data.summary.total_budget > 0 ? formatCurrency(data.summary.total_budget) : 'No Cap Set'}
          </span>
        </div>
      </div>

      {/* Dynamic AI Insights Cards with Emojis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.insights.map((insight, idx) => {
          const style = getSeverityStyle(insight.severity);
          return (
            <div
              key={idx}
              style={{
                backgroundColor: style.bg,
                border: style.border,
                borderRadius: 'var(--radius-lg)',
                padding: '0.875rem 1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}
            >
              {style.icon}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {insight.title}
                  </h4>
                  {insight.category && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '0.1rem 0.4rem',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      {insight.category}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', margin: '0.3rem 0 0 0', lineHeight: 1.45 }}>
                  {insight.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Budget Recommendations */}
      {data.budget_recommendations && data.budget_recommendations.length > 0 && (
        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <Zap size={14} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)' }}>
              AI Recommended Category Budget Caps
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {data.budget_recommendations.slice(0, 3).map((rec, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{rec.category}</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {formatCurrency(rec.recommended_budget)}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                  {rec.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
