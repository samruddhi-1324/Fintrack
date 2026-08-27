'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useBudgets } from '../../hooks/useBudgets';

interface DailyLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLimit?: number;
}

export default function DailyLimitModal({ isOpen, onClose, currentLimit = 0 }: DailyLimitModalProps) {
  const { setBudget, isSetting } = useBudgets();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount(currentLimit > 0 ? currentLimit.toString() : '500');
      setError(null);
    }
  }, [isOpen, currentLimit]);

  const handleQuickSelect = (val: number) => {
    setAmount(val.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid daily limit greater than ₹0');
      return;
    }

    try {
      await setBudget({
        category_id: null,
        amount: parsedAmount,
        period: 'daily'
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update daily spending limit');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎯 Set Daily Spending Limit">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Set your maximum target daily expense. FinTrack will track today's spending live and alert you if you approach or exceed this cap.
        </p>

        <Input
          label="Target Daily Limit (₹)"
          type="number"
          step="10"
          placeholder="e.g. 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={error || undefined}
          required
        />

        <div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
            Quick Presets:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[200, 500, 1000, 2000, 5000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickSelect(preset)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: amount === preset.toString() ? 'var(--accent-primary)' : 'var(--bg-card)',
                  color: amount === preset.toString() ? '#ffffff' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                ₹{preset}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSetting}>
            {isSetting ? 'Saving...' : 'Save Daily Limit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
