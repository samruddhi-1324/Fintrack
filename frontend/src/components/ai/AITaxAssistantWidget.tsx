'use client';

import React, { useState, useEffect } from 'react';
import { aiApi } from '../../services/aiApi';
import { TaxAssistantResponse } from '../../types/ai';

export const AITaxAssistantWidget: React.FC = () => {
  const [data, setData] = useState<TaxAssistantResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'regime' | 'deductions' | 'gst' | 'transactions'>('regime');

  const fetchTaxSummary = async () => {
    try {
      setLoading(true);
      const res = await aiApi.getTaxAssistant();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load AI tax summary:', err);
      setError(err?.message || 'Failed to load AI tax summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxSummary();
  }, []);

  return (
    <div
      style={{
        background: 'var(--bg-secondary, rgba(30, 41, 59, 0.7))',
        border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
        borderRadius: '16px',
        padding: '24px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        color: 'var(--text-primary, #F8FAFC)',
        marginBottom: '24px'
      }}
    >
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.6rem' }}>🏛️</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              AI Tax Deduction & GST Assistant (Indian Context)
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#FBBF24',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}
            >
              FY 2026-27 (AY 2027-28)
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)', margin: 0 }}>
            Audits PostgreSQL transactions under IT Act Sections (80C, 80D, 80G, HRA 10(13A), 24b) and CGST Act (Input Tax Credit).
          </p>
        </div>

        {/* Refresh Action */}
        <button
          onClick={fetchTaxSummary}
          disabled={loading}
          style={{
            background: 'var(--bg-tertiary, rgba(255, 255, 255, 0.05))',
            border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
            color: 'var(--text-primary, #F8FAFC)',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          🔄 {loading ? 'Auditing Tax...' : 'Re-audit Tax Logs'}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary, #94A3B8)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🧾</div>
          Auditing transaction history against Indian Income Tax Act & GST slabs...
        </div>
      ) : error ? (
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#FCA5A5' }}>
          ⚠️ {error}
        </div>
      ) : data ? (
        <>
          {/* Optimal Regime Recommendation Box */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(5, 150, 105, 0.08))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                AI TAX REGIME RECOMMENDATION
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F8FAFC', margin: '4px 0' }}>
                Recommended: <span style={{ color: '#10B981' }}>{data.regime_comparison.recommended_regime}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                {data.regime_comparison.recommendation_reason}
              </p>
            </div>

            <div
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '12px',
                padding: '12px 18px',
                textAlign: 'right'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#34D399', fontWeight: 600 }}>POTENTIAL TAX SAVINGS</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>
                ₹{data.regime_comparison.potential_tax_savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'regime', label: 'Old vs New Tax Regime 📊' },
              { id: 'deductions', label: `Section Deductions (₹${data.total_tax_deductions.toLocaleString('en-IN')}) 📜` },
              { id: 'gst', label: `GST Input Tax Credit (₹${data.gst_summary.eligible_itc_claimable.toLocaleString('en-IN')}) 🧾` },
              { id: 'transactions', label: `Deductible Expenses (${data.deductible_transactions.length}) 💳` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  background: activeTab === tab.id ? 'var(--accent-primary, #6366F1)' : 'var(--bg-tertiary, rgba(255, 255, 255, 0.05))',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary, #94A3B8)',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  borderRadius: '20px',
                  padding: '7px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Old vs New Regime */}
          {activeTab === 'regime' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {/* Old Regime Card */}
              <div
                style={{
                  background: data.regime_comparison.recommended_regime.includes('Old')
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'var(--bg-tertiary, rgba(255, 255, 255, 0.04))',
                  border: `1px solid ${data.regime_comparison.recommended_regime.includes('Old') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '14px',
                  padding: '18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>Old Tax Regime</h3>
                  {data.regime_comparison.recommended_regime.includes('Old') && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#10B981', color: '#FFF' }}>RECOMMENDED</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#94A3B8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Assumed Gross Income:</span>
                    <strong style={{ color: '#F8FAFC' }}>₹{data.regime_comparison.estimated_annual_income.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Eligible Deductions (80C/80D/HRA):</span>
                    <strong style={{ color: '#10B981' }}>-₹{data.total_tax_deductions.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Standard Deduction:</span>
                    <strong style={{ color: '#10B981' }}>-₹50,000</strong>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                    <span style={{ fontWeight: 700, color: '#F8FAFC' }}>Estimated Tax Payable:</span>
                    <strong style={{ color: '#F43F5E' }}>₹{data.regime_comparison.old_regime_tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              </div>

              {/* New Regime Card */}
              <div
                style={{
                  background: data.regime_comparison.recommended_regime.includes('New')
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'var(--bg-tertiary, rgba(255, 255, 255, 0.04))',
                  border: `1px solid ${data.regime_comparison.recommended_regime.includes('New') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                  borderRadius: '14px',
                  padding: '18px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#F8FAFC' }}>New Tax Regime (Sec 115BAC)</h3>
                  {data.regime_comparison.recommended_regime.includes('New') && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#10B981', color: '#FFF' }}>RECOMMENDED</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: '#94A3B8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Assumed Gross Income:</span>
                    <strong style={{ color: '#F8FAFC' }}>₹{data.regime_comparison.estimated_annual_income.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Standard Deduction (FY 2026):</span>
                    <strong style={{ color: '#10B981' }}>-₹75,000</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Section 80C/80D Exemptions:</span>
                    <span style={{ color: '#F43F5E' }}>Not Allowed</span>
                  </div>
                  <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem' }}>
                    <span style={{ fontWeight: 700, color: '#F8FAFC' }}>Estimated Tax Payable:</span>
                    <strong style={{ color: '#F43F5E' }}>₹{data.regime_comparison.new_regime_tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Section Breakdown */}
          {activeTab === 'deductions' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {data.section_breakdown.map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'var(--bg-tertiary, rgba(255, 255, 255, 0.04))',
                    border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366F1' }}>
                      SECTION {sec.section_code}
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', color: '#F8FAFC' }}>
                      {sec.status_badge}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC', marginBottom: '8px' }}>
                    {sec.section_name}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94A3B8', marginBottom: '4px' }}>
                    <span>Eligible Claim: <strong style={{ color: '#10B981' }}>₹{sec.eligible_amount.toLocaleString('en-IN')}</strong></span>
                    <span>Max Cap: ₹{sec.max_limit.toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(sec.percentage_utilized, 100)}%`,
                        height: '100%',
                        background: sec.percentage_utilized >= 100 ? '#10B981' : '#6366F1'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: GST ITC Summary */}
          {activeTab === 'gst' && (
            <div style={{ background: 'var(--bg-tertiary, rgba(255, 255, 255, 0.04))', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Eligible GST ITC Claimable</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981' }}>
                    ₹{data.gst_summary.eligible_itc_claimable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Available for GSTR-3B offset</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Total Business Expenses</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F8FAFC' }}>
                    ₹{data.gst_summary.total_business_expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Across {data.gst_summary.gst_eligible_expenses_count} items</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>Blocked Credit u/s 17(5)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#F43F5E' }}>
                    ₹{data.gst_summary.blocked_credit_17_5.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Personal food, dining & cabs</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Deductible Expense Log */}
          {activeTab === 'transactions' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94A3B8' }}>
                    <th style={{ padding: '8px 12px' }}>Title</th>
                    <th style={{ padding: '8px 12px' }}>Amount</th>
                    <th style={{ padding: '8px 12px' }}>Tax Section</th>
                    <th style={{ padding: '8px 12px' }}>GST Eligibility</th>
                  </tr>
                </thead>
                <tbody>
                  {data.deductible_transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#F8FAFC' }}>{tx.title}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#10B981' }}>₹{tx.amount.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', fontWeight: 600 }}>
                          {tx.tax_section}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {tx.gst_eligible ? (
                          <span style={{ color: '#34D399', fontWeight: 600 }}>Eligible (Est. GST ₹{tx.estimated_gst_amount})</span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>Personal / Exempt</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};
