'use client';

import React, { useState, useEffect } from 'react';
import { aiApi } from '../../services/aiApi';
import { GoalSimulationResponse, CategoryCutbackRecommendation } from '../../types/ai';
import { formatCurrency } from '../../lib/formatters';

interface AIGoalSimulatorWidgetProps {
  onApplyBudgets?: () => void;
}

export const AIGoalSimulatorWidget: React.FC<AIGoalSimulatorWidgetProps> = ({ onApplyBudgets }) => {
  const [goalName, setGoalName] = useState<string>('Buy MacBook Pro M3');
  const [targetAmount, setTargetAmount] = useState<number>(150000);
  const [targetMonths, setTargetMonths] = useState<number>(6);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [simulation, setSimulation] = useState<GoalSimulationResponse | null>(null);

  const runSimulation = async () => {
    if (!goalName.trim()) {
      setError('Please enter a goal name.');
      return;
    }
    if (targetAmount <= 0) {
      setError('Target amount must be greater than 0.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await aiApi.simulateGoal({
        goal_name: goalName.trim(),
        target_amount: targetAmount,
        target_months: targetMonths
      });
      setSimulation(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to simulate goal feasibility.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const getFeasibilityBg = (score: number) => {
    if (score >= 80) return 'rgba(16, 185, 129, 0.15)';
    if (score >= 60) return 'rgba(99, 102, 241, 0.15)';
    if (score >= 40) return 'rgba(245, 158, 11, 0.15)';
    return 'rgba(239, 68, 68, 0.15)';
  };

  const getFeasibilityBorder = (score: number) => {
    if (score >= 80) return '1px solid rgba(16, 185, 129, 0.4)';
    if (score >= 60) return '1px solid rgba(99, 102, 241, 0.4)';
    if (score >= 40) return '1px solid rgba(245, 158, 11, 0.4)';
    return '1px solid rgba(239, 68, 68, 0.4)';
  };

  const getFeasibilityColor = (score: number) => {
    if (score >= 80) return 'var(--accent-success)';
    if (score >= 60) return 'var(--accent-primary)';
    if (score >= 40) return 'var(--accent-warning)';
    return 'var(--accent-danger)';
  };

  return (
    <div
      style={{
        padding: '1.25rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      {/* Widget Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              AI "What-If" Goal & Savings Simulator
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
              Simulate savings target feasibility & calculate category cutbacks to hit your goals on time
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runSimulation}
          disabled={loading}
          style={{
            padding: '0.45rem 0.85rem',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          {loading ? '🔄 Simulating...' : '⚡ Recalculate Goal'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--accent-danger)', fontSize: '0.8rem' }}>
          🚨 {error}
        </div>
      )}

      {/* Simulator Inputs Card */}
      <div style={{ padding: '1rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* Goal Title */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Financial Goal Target
            </label>
            <input
              type="text"
              placeholder="e.g. Buy Laptop, Trip to Goa"
              value={goalName}
              onChange={e => setGoalName(e.target.value)}
              style={{
                width: '100%',
                marginTop: '0.25rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.88rem',
                fontWeight: 600
              }}
            />
          </div>

          {/* Target Amount */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target Amount (₹)
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                {formatCurrency(targetAmount)}
              </span>
            </div>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={5000}
              value={targetAmount}
              onChange={e => setTargetAmount(Number(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          {/* Target Timeline */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target Timeline (Months)
              </label>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                {targetMonths} Month{targetMonths > 1 ? 's' : ''}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={36}
              step={1}
              value={targetMonths}
              onChange={e => setTargetMonths(Number(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={runSimulation}
          disabled={loading}
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: 'var(--accent-primary)',
            color: '#000000',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          {loading ? 'Simulating Feasibility...' : '🎯 Run Goal Simulation'}
        </button>
      </div>

      {/* Simulation Results Display */}
      {simulation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Feasibility Header Banner */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: getFeasibilityBg(simulation.feasibility_score),
              border: getFeasibilityBorder(simulation.feasibility_score),
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{simulation.feasibility_emoji}</span>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: getFeasibilityColor(simulation.feasibility_score) }}>
                  {simulation.feasibility_grade}
                </span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-card)', borderRadius: '9999px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Feasibility: {simulation.feasibility_score}%
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {simulation.summary_narrative}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Completion Target</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{simulation.projected_achievement_date}</div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Required Monthly Savings</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{formatCurrency(simulation.required_monthly_savings)}/mo</div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Current Savings Pace</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-success)' }}>{formatCurrency(simulation.current_monthly_savings_pace)}/mo</div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Monthly Savings Gap</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: simulation.monthly_gap <= 0 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                {simulation.monthly_gap <= 0 ? '✅ Covered' : `₹${simulation.monthly_gap.toLocaleString('en-IN')}/mo`}
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Timeline (Current Pace)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{simulation.current_pace_months_needed} Months</div>
            </div>
          </div>

          {/* Recommended Category Cutbacks */}
          {simulation.category_cutbacks && simulation.category_cutbacks.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                ✂️ AI Recommended Category Cutbacks
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {simulation.category_cutbacks.map((cut: CategoryCutbackRecommendation, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cut.category_name}</span>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)', borderRadius: 'var(--radius-sm)', fontWeight: 700 }}>
                        Cut -{intPct(cut.suggested_cutback_pct)}%
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Current spend: <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(cut.current_monthly_spend)}/mo</span>
                    </div>

                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                      + Unlock {formatCurrency(cut.monthly_savings_unlocked)}/mo
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tactical Action Plan */}
          {simulation.tactical_advice && simulation.tactical_advice.length > 0 && (
            <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                💡 AI Tactical Action Plan
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {simulation.tactical_advice.map((tip: string, idx: number) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function intPct(val: number): number {
  return Math.round(val);
}
