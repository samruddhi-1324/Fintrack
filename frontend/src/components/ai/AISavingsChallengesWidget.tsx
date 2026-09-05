'use client';

import React, { useState, useEffect } from 'react';
import { aiApi } from '../../services/aiApi';
import { SavingsChallengesResponse, SavingsChallengeItem } from '../../types/ai';

export const AISavingsChallengesWidget: React.FC = () => {
  const [data, setData] = useState<SavingsChallengesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'available' | 'completed'>('all');

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const res = await aiApi.getSavingsChallenges();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load savings challenges:', err);
      setError(err?.message || 'Failed to load savings challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleClaim = async (challenge: SavingsChallengeItem) => {
    if (claimingId) return;
    try {
      setClaimingId(challenge.id);
      const res = await aiApi.claimSavingsChallenge(challenge.id);
      setToastMessage(res.message || `🎉 Completed '${challenge.title}'! Earned +${challenge.reward_points} XP!`);
      
      // Update local state dynamically
      if (data) {
        const updatedChallenges = data.challenges.map((c) =>
          c.id === challenge.id ? { ...c, status: 'completed', progress_percentage: 100 } : c
        );
        setData({
          ...data,
          total_points: data.total_points + challenge.reward_points,
          current_streak_days: data.current_streak_days + 1,
          total_savings_unlocked: data.total_savings_unlocked + challenge.target_savings,
          challenges: updatedChallenges
        });
      }
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to claim challenge:', err);
      setToastMessage('⚠️ Could not complete challenge. Try again.');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setClaimingId(null);
    }
  };

  const filteredChallenges = (data?.challenges || []).filter((c) => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

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
        marginBottom: '24px',
        position: 'relative'
      }}
    >
      {/* Notification Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            color: '#FFFFFF',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            zIndex: 10,
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.6rem' }}>🎯</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              AI Savings Challenges & Badges
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                background: 'rgba(236, 72, 153, 0.15)',
                color: '#F472B6',
                border: '1px solid rgba(236, 72, 153, 0.3)'
              }}
            >
              GAMIFIED AI
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #94A3B8)', margin: 0 }}>
            Micro-challenges tailored to your PostgreSQL spending habits. Earn FinTrack XP & Badges!
          </p>
        </div>

        {/* Refresh Action */}
        <button
          onClick={fetchChallenges}
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
          🔄 {loading ? 'Auditing...' : 'Refresh Challenges'}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary, #94A3B8)' }}>
          <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🎲</div>
          Analyzing transaction history for personalized savings challenges...
        </div>
      ) : error ? (
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#FCA5A5' }}>
          ⚠️ {error}
        </div>
      ) : data ? (
        <>
          {/* Trophy & Stats Dashboard Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              marginBottom: '20px'
            }}
          >
            {/* Level Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '2.2rem' }}>{data.level_badge}</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>XP Level</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#F8FAFC' }}>{data.level_title}</div>
                <div style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 600 }}>{data.total_points} XP</div>
              </div>
            </div>

            {/* Streak */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '2.2rem' }}>🔥</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Savings Streak</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#EF4444' }}>{data.current_streak_days} Days Streak</div>
                <div style={{ fontSize: '0.75rem', color: '#10B981' }}>Active & Growing</div>
              </div>
            </div>

            {/* Total Savings Unlocked */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ fontSize: '2.2rem' }}>💰</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unlocked Savings</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>
                  ₹{data.total_savings_unlocked.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Across Challenges</div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'all', label: 'All Challenges 🎯' },
              { id: 'active', label: `Active (${data.challenges.filter(c => c.status === 'active').length}) ⚡` },
              { id: 'available', label: 'Available 📥' },
              { id: 'completed', label: 'Completed 🏆' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                style={{
                  background: filterStatus === tab.id ? 'var(--accent-primary, #6366F1)' : 'var(--bg-tertiary, rgba(255, 255, 255, 0.05))',
                  color: filterStatus === tab.id ? '#FFFFFF' : 'var(--text-secondary, #94A3B8)',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                  borderRadius: '20px',
                  padding: '6px 14px',
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

          {/* Challenges Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}
          >
            {filteredChallenges.map((challenge) => {
              const isCompleted = challenge.status === 'completed';
              const isActive = challenge.status === 'active';
              
              return (
                <div
                  key={challenge.id}
                  style={{
                    background: isCompleted
                      ? 'rgba(16, 185, 129, 0.06)'
                      : isActive
                      ? 'rgba(99, 102, 241, 0.08)'
                      : 'var(--bg-tertiary, rgba(255, 255, 255, 0.04))',
                    border: `1px solid ${
                      isCompleted
                        ? 'rgba(16, 185, 129, 0.3)'
                        : isActive
                        ? 'rgba(99, 102, 241, 0.3)'
                        : 'var(--border-color, rgba(255, 255, 255, 0.1))'
                    }`,
                    borderRadius: '14px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}
                >
                  {/* Top Badge & Header */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{challenge.badge_icon}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: challenge.difficulty.includes('Easy')
                              ? 'rgba(16, 185, 129, 0.15)'
                              : challenge.difficulty.includes('Medium')
                              ? 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            color: challenge.difficulty.includes('Easy')
                              ? '#34D399'
                              : challenge.difficulty.includes('Medium')
                              ? '#FBBF24'
                              : '#F87171'
                          }}
                        >
                          {challenge.difficulty}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#F59E0B',
                          background: 'rgba(245, 158, 11, 0.1)',
                          padding: '3px 8px',
                          borderRadius: '8px'
                        }}
                      >
                        +{challenge.reward_points} XP
                      </span>
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px 0', color: '#F8FAFC' }}>
                      {challenge.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                      {challenge.description}
                    </p>
                  </div>

                  {/* Target & Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '6px' }}>
                      <span>Target Savings: <strong style={{ color: '#10B981' }}>₹{challenge.target_savings}</strong></span>
                      <span>Duration: {challenge.duration_days} Days</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                      <div
                        style={{
                          width: `${challenge.progress_percentage}%`,
                          height: '100%',
                          background: isCompleted ? '#10B981' : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>

                    {/* Action Button */}
                    {isCompleted ? (
                      <div style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#10B981', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                        ✅ Challenge Completed! (+{challenge.reward_points} XP)
                      </div>
                    ) : (
                      <button
                        onClick={() => handleClaim(challenge)}
                        disabled={claimingId === challenge.id}
                        style={{
                          width: '100%',
                          padding: '9px',
                          borderRadius: '10px',
                          border: 'none',
                          background: isActive
                            ? 'linear-gradient(135deg, #10B981, #059669)'
                            : 'linear-gradient(135deg, #6366F1, #4F46E5)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        {claimingId === challenge.id
                          ? 'Claiming...'
                          : isActive
                          ? '🎉 Complete & Claim Reward'
                          : '🚀 Accept Challenge'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
};
