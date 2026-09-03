'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../../services/aiApi';
import { Activity, ShieldCheck, Award, Zap, TrendingUp, AlertCircle, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export const FinancialHealthScoreWidget: React.FC = () => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['financial-health-score'],
    queryFn: () => aiApi.getHealthScore(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    retry: 1
  });

  if (isLoading) {
    return (
      <div
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity className="animate-pulse" size={22} style={{ color: 'var(--accent-success)' }} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Calculating 0–100 Financial Health Score across 4 pillars...
          </span>
        </div>
        <RefreshCw className="animate-spin" size={16} style={{ color: 'var(--text-secondary)' }} />
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
              Financial Health Score Evaluation
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Could not load financial score. Click retry to re-audit.
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
          Retry Audit
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'var(--accent-success)';
    if (score >= 70) return '#34d399';
    if (score >= 55) return 'var(--accent-warning)';
    if (score >= 40) return '#fb923c';
    return 'var(--accent-danger)';
  };

  const scoreColor = getScoreColor(data.score);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
        border: `1px solid ${scoreColor}55`,
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
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Activity size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                AI Financial Health Score
              </h3>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--accent-success)',
                  fontWeight: 700
                }}
              >
                Grade {data.grade}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Comprehensive multi-pillar evaluation of your financial discipline
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
          {isFetching ? 'Auditing...' : 'Re-audit Score'}
        </button>
      </div>

      {/* Main Score Hero Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.15) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        {/* Left: Score Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              border: `4px solid ${scoreColor}`,
              boxShadow: `0 0 20px ${scoreColor}40`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-primary)',
              flexShrink: 0
            }}
          >
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
              {data.score}
            </span>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
              / 100
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>{data.tier_emoji}</span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {data.tier}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.35rem 0 0 0', lineHeight: 1.45, maxWidth: '500px' }}>
              {data.summary_verdict}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Health Pillars Grid */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-success)', display: 'block', marginBottom: '0.75rem' }}>
          📊 Score Breakdown Across 4 Core Pillars
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {data.pillars.map((pillar, idx) => {
            const pct = Math.round((pillar.score / pillar.max_score) * 100);
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {pillar.emoji} {pillar.name}
                  </span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: getScoreColor(pct) }}>
                    {pillar.score} / {pillar.max_score} <span style={{ fontSize: '0.7rem', fontWeight: 400 }}>pts</span>
                  </span>
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6 }}
                    style={{
                      height: '100%',
                      backgroundColor: getScoreColor(pct),
                      borderRadius: 'var(--radius-full)'
                    }}
                  />
                </div>

                <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}>
                  {pillar.feedback}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Score Booster Tips */}
      {data.actionable_tips && data.actionable_tips.length > 0 && (
        <div
          style={{
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}>
            <Zap size={14} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-primary)' }}>
              AI Recommendations to Boost Your Health Score
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {data.actionable_tips.map((tip, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                <CheckCircle2 size={14} style={{ color: 'var(--accent-success)', marginTop: '2px', flexShrink: 0 }} />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
