'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { aiApi } from '../../services/aiApi';
import { GroupBillSplitResponse } from '../../types/ai';

interface GroupBillSplitterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTitle?: string;
  initialAmount?: number;
  onLogPersonalShare?: (parsed: { title: string; amount: number; category_id?: string }) => void;
}

export const GroupBillSplitterModal: React.FC<GroupBillSplitterModalProps> = ({
  isOpen,
  onClose,
  initialTitle = '',
  initialAmount = 0,
  onLogPersonalShare
}) => {
  const [title, setTitle] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [payerName, setPayerName] = useState<string>('You');
  const [participantInput, setParticipantInput] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>(['You', 'Rahul', 'Priya']);
  const [splitMode, setSplitMode] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [customShares, setCustomShares] = useState<Record<string, number>>({});
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GroupBillSplitResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (initialTitle) setTitle(initialTitle);
      if (initialAmount > 0) setTotalAmount(initialAmount.toString());
    }
  }, [isOpen, initialTitle, initialAmount]);

  if (!isOpen) return null;

  const handleAddParticipant = () => {
    const trimmed = participantInput.trim();
    if (trimmed && !participants.some(p => p.toLowerCase() === trimmed.toLowerCase())) {
      setParticipants([...participants, trimmed]);
      setParticipantInput('');
    }
  };

  const handleRemoveParticipant = (nameToRemove: string) => {
    if (participants.length <= 2) return;
    setParticipants(participants.filter(p => p !== nameToRemove));
    if (payerName === nameToRemove) {
      setPayerName('You');
    }
  };

  const handleCustomShareChange = (name: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCustomShares(prev => ({ ...prev, [name]: num }));
  };

  const handleCalculateSplit = async () => {
    const amountNum = parseFloat(totalAmount);
    if (!title.trim()) {
      setError('Please enter a bill title.');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid bill total amount.');
      return;
    }
    if (participants.length < 2) {
      setError('At least 2 group members are required to split a bill.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await aiApi.splitGroupBill({
        title: title.trim(),
        total_amount: amountNum,
        payer_name: payerName,
        participants: participants,
        split_mode: splitMode,
        custom_shares: customShares
      });

      setResult(resp);
    } catch (err: any) {
      setError(err?.message || 'Failed to calculate group bill split.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWhatsApp = () => {
    if (!result?.whatsapp_summary) return;
    navigator.clipboard.writeText(result.whatsapp_summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFillExpenseModal = () => {
    if (!result || !onLogPersonalShare) return;
    onLogPersonalShare({
      title: `[Share] ${result.title}`,
      amount: result.user_personal_share,
      category_id: result.category_id || undefined
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="👥 AI Group Bill & Debt Splitter">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner Header */}
        <div
          style={{
            padding: '0.875rem 1rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>👥</span>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Group Receipt & Debt Matrix Calculator
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Split dinner bills, trip expenses & group debts with zero-drift paise precision.
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-danger)',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>🚨 {error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
          </div>
        )}

        {/* Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Bill Title / Description <span style={{ color: 'var(--accent-primary)' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Olive Bistro Dinner"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: '100%',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginTop: '0.25rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.75rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Bill Amount (₹) <span style={{ color: 'var(--accent-primary)' }}>*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 1500"
              value={totalAmount}
              onChange={e => setTotalAmount(e.target.value)}
              style={{
                width: '100%',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--accent-success)',
                marginTop: '0.25rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 0.75rem'
              }}
            />
          </div>
        </div>

        {/* Payer & Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Who Paid Upfront? <span style={{ color: 'var(--accent-primary)' }}>*</span>
            </label>
            <select
              value={payerName}
              onChange={e => setPayerName(e.target.value)}
              style={{
                padding: '0.35rem 0.75rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              {participants.map(p => (
                <option key={p} value={p}>
                  {p} {p === 'You' ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Group Member Chips */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>
              Group Members ({participants.length})
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.625rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {participants.map(p => (
                <span
                  key={p}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: p === payerName ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                    color: p === payerName ? 'var(--accent-primary)' : 'var(--text-primary)',
                    border: p === payerName ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid var(--border-color)'
                  }}
                >
                  <span>{p}</span>
                  {p === payerName && <span style={{ fontSize: '0.7rem' }}>💳</span>}
                  {participants.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(p)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 'bold', marginLeft: '0.15rem' }}
                      title="Remove participant"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {/* Add friend input */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Add friend name (e.g. Rahul)"
                value={participantInput}
                onChange={e => setParticipantInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.65rem',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem'
                }}
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddParticipant}>
                + Add Member
              </Button>
            </div>
          </div>
        </div>

        {/* Split Mode Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'block' }}>
            Select Split Method
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setSplitMode('equal')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: splitMode === 'equal' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                backgroundColor: splitMode === 'equal' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                color: splitMode === 'equal' ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
            >
              ⚖️ Equal
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('percentage')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: splitMode === 'percentage' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                backgroundColor: splitMode === 'percentage' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                color: splitMode === 'percentage' ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
            >
              % Percentage
            </button>
            <button
              type="button"
              onClick={() => setSplitMode('custom')}
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: splitMode === 'custom' ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                backgroundColor: splitMode === 'custom' ? 'rgba(99, 102, 241, 0.2)' : 'var(--bg-card)',
                color: splitMode === 'custom' ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
            >
              💰 Custom
            </button>
          </div>
        </div>

        {/* Custom shares input if not equal */}
        {splitMode !== 'equal' && (
          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(15, 23, 42, 0.6)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {splitMode === 'percentage' ? 'Enter percentage (%) for each member:' : 'Enter rupee amount (₹) for each member:'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.5rem' }}>
              {participants.map(p => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', backgroundColor: 'var(--bg-card)', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p}</span>
                  <input
                    type="number"
                    placeholder={splitMode === 'percentage' ? '%' : '₹'}
                    value={customShares[p] !== undefined ? customShares[p] : ''}
                    onChange={e => handleCustomShareChange(p, e.target.value)}
                    style={{
                      width: '70px',
                      padding: '0.2rem 0.4rem',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      textAlign: 'right',
                      fontSize: '0.78rem',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button type="button" onClick={handleCalculateSplit} isLoading={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
          ⚡ Calculate Debt Split
        </Button>

        {/* Calculated Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            {/* Header info */}
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{result.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Paid by {result.payer_name} • {result.split_mode.toUpperCase()} split</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Bill</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>₹{result.total_amount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Individual Breakdown */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                📊 Individual Shares Breakdown
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                {result.participants.map(p => (
                  <div key={p.name} style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.name} {p.is_payer ? '💳' : ''}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{p.share_percentage}% of total</div>
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{p.share_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Debt Settlement Matrix */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                💸 Debt Settlement Matrix
              </div>
              {result.settlement_transfers.length === 0 ? (
                <div style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-success)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
                  ✅ No debts owed! Everyone has settled their equal share.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.settlement_transfers.map((s, idx) => (
                    <div key={idx} style={{ padding: '0.5rem 0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{s.message}</span>
                      <span style={{ fontWeight: 700 }}>₹{s.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WhatsApp Shareable Text */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  📲 WhatsApp Shareable Summary
                </span>
                <button
                  type="button"
                  onClick={handleCopyWhatsApp}
                  style={{
                    padding: '0.2rem 0.5rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? '✅ Copied!' : '📋 Copy Text'}
                </button>
              </div>
              <textarea
                readOnly
                rows={6}
                value={result.whatsapp_summary}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  color: 'var(--accent-success)',
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  resize: 'none'
                }}
              />
            </div>

            {/* Log My Share Footer */}
            {onLogPersonalShare && (
              <div style={{ padding: '0.875rem 1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your Share ({result.payer_name === 'You' ? 'You' : 'Calculated'})</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-success)' }}>
                    ₹{result.user_personal_share.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <Button type="button" onClick={handleFillExpenseModal}>
                  ✨ Log My Share as FinTrack Expense
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
