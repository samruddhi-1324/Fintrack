'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiApi } from '../../services/aiApi';
import { AnomalyItem } from '../../types/ai';
import { formatCurrency } from '../../lib/formatters';
import { ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp, Copy, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIAnomaliesWidget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'subscription_hike' | 'duplicate_charge' | 'category_spike'>('all');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['ai-anomalies'],
    queryFn: () => aiApi.getAnomalies(),
    staleTime: 1000 * 60 * 3, // 3 minutes cache
    retry: 1
  });

  if (isLoading) {
    return (
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert className="animate-pulse" size={22} style={{ color: 'var(--accent-warning)' }} />
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Auditing transactions for subscription price hikes & duplicate charges...
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
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              AI Anomaly & Subscription Price-Hike Detector
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              Real-time audit active. Log recurring transactions to monitor price hikes & duplicate charges.
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          style={{
            padding: '0.4rem 0.75rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <RefreshCw size={13} /> Retry Audit
        </button>
      </div>
    );
  }

  const filteredAnomalies = activeTab === 'all'
    ? data.anomalies
    : data.anomalies.filter((a) => a.type === activeTab);

  return (
    <div
      style={{
        padding: '1.25rem 1.5rem',
        backgroundColor: 'var(--bg-card)',
        border: data.total_anomalies_found > 0 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: data.total_anomalies_found > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: data.total_anomalies_found > 0 ? 'var(--accent-danger)' : 'var(--accent-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {data.total_anomalies_found > 0 ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              AI Anomaly & Price-Hike Detector
              {data.total_anomalies_found > 0 && (
                <span
                  style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    color: 'var(--accent-danger)',
                    fontSize: '0.75rem',
                    fontWeight: 800
                  }}
                >
                  {data.total_anomalies_found} Alert{data.total_anomalies_found > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
              {data.summary_headline}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Re-audit transactions"
        >
          <RefreshCw className={isFetching ? 'animate-spin' : ''} size={15} />
        </button>
      </div>

      {/* Filter Tabs if Anomalies Exist */}
      {data.total_anomalies_found > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: activeTab === 'all' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
              backgroundColor: activeTab === 'all' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
              color: activeTab === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            All ({data.total_anomalies_found})
          </button>
          {data.subscription_hikes_count > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('subscription_hike')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeTab === 'subscription_hike' ? '1px solid var(--accent-warning)' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'subscription_hike' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-secondary)',
                color: activeTab === 'subscription_hike' ? 'var(--accent-warning)' : 'var(--text-secondary)'
              }}
            >
              📈 Price Hikes ({data.subscription_hikes_count})
            </button>
          )}
          {data.duplicate_count > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('duplicate_charge')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeTab === 'duplicate_charge' ? '1px solid var(--accent-danger)' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'duplicate_charge' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-secondary)',
                color: activeTab === 'duplicate_charge' ? 'var(--accent-danger)' : 'var(--text-secondary)'
              }}
            >
              👯 Duplicates ({data.duplicate_count})
            </button>
          )}
          {data.category_spikes_count > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('category_spike')}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeTab === 'category_spike' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                backgroundColor: activeTab === 'category_spike' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-secondary)',
                color: activeTab === 'category_spike' ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
            >
              ⚡ Spikes ({data.category_spikes_count})
            </button>
          )}
        </div>
      )}

      {/* Anomaly Items List */}
      {data.total_anomalies_found > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AnimatePresence>
            {filteredAnomalies.map((item) => {
              const borderCol =
                item.severity === 'danger'
                  ? 'rgba(239, 68, 68, 0.35)'
                  : item.severity === 'warning'
                  ? 'rgba(245, 158, 11, 0.35)'
                  : 'rgba(99, 102, 241, 0.35)';

              const bgCol =
                item.severity === 'danger'
                  ? 'rgba(239, 68, 68, 0.06)'
                  : item.severity === 'warning'
                  ? 'rgba(245, 158, 11, 0.06)'
                  : 'rgba(99, 102, 241, 0.06)';

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  style={{
                    padding: '0.875rem 1rem',
                    backgroundColor: bgCol,
                    border: `1px solid ${borderCol}`,
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{item.badge_emoji}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                    </div>

                    {Boolean(item.change_pct && item.change_pct > 0) && (
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: 'var(--accent-danger)'
                        }}
                      >
                        +{item.change_pct}% Increase
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                    {item.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>Category: <strong>{item.category_name}</strong></span>
                    <span>Date: {item.date}</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      Amount: {formatCurrency(item.current_amount)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div
          style={{
            padding: '1.25rem',
            textAlign: 'center',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            border: '1px dashed rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Financial Records Clean & Secure
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            No subscription price hikes, duplicate charges, or category spikes detected across your recent transactions.
          </span>
        </div>
      )}
    </div>
  );
};

export default AIAnomaliesWidget;
