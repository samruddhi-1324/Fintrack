'use client';

import React, { useState, useEffect } from 'react';
import { aiApi } from '../../services/aiApi';
import { GroupBillSplitResponse, GroupBillParticipantShare, DebtSettlementItem } from '../../types/ai';

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
    if (participants.length <= 2) return; // Keep at least 2
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
    <div
      style={{ zIndex: 99999 }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <div>
              <h2 className="text-lg font-bold text-white">AI Group Bill & Debt Splitter</h2>
              <p className="text-xs text-slate-400">Split restaurant bills, trip expenses & debts zero-drift</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-between">
              <span>🚨 {error}</span>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bill Title / Description <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Olive Bistro Dinner, Villa Rent"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Total Bill Amount (₹) <span className="text-indigo-400">*</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Payer & Participants */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-300">
                Who Paid Upfront? <span className="text-indigo-400">*</span>
              </label>
              <select
                value={payerName}
                onChange={e => setPayerName(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {participants.map(p => (
                  <option key={p} value={p}>
                    {p} {p === 'You' ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Group Members Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Group Members ({participants.length})
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                {participants.map(p => (
                  <span
                    key={p}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      p === payerName
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <span>{p}</span>
                    {p === payerName && <span className="text-[10px] text-indigo-400">💳</span>}
                    {participants.length > 2 && (
                      <button
                        onClick={() => handleRemoveParticipant(p)}
                        className="hover:text-rose-400 text-slate-400 ml-0.5 text-xs font-bold"
                        title="Remove participant"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Add member input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add friend name (e.g. Amit)"
                  value={participantInput}
                  onChange={e => setParticipantInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddParticipant())}
                  className="flex-1 px-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>

          {/* Split Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Split Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSplitMode('equal')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  splitMode === 'equal'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚖️ Equal Split
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('percentage')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  splitMode === 'percentage'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                % Percentage
              </button>
              <button
                type="button"
                onClick={() => setSplitMode('custom')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  splitMode === 'custom'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                💰 Custom Amount
              </button>
            </div>
          </div>

          {/* Custom Shares Inputs if not equal */}
          {splitMode !== 'equal' && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
              <p className="text-xs font-medium text-slate-400">
                {splitMode === 'percentage'
                  ? 'Enter percentage (%) for each member:'
                  : 'Enter rupee amount (₹) for each member:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {participants.map(p => (
                  <div key={p} className="flex items-center justify-between gap-2 bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-200 truncate">{p}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        placeholder={splitMode === 'percentage' ? '%' : '₹'}
                        value={customShares[p] !== undefined ? customShares[p] : ''}
                        onChange={e => handleCustomShareChange(p, e.target.value)}
                        className="w-20 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-right text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-xs text-slate-400 font-bold">
                        {splitMode === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <button
            type="button"
            onClick={handleCalculateSplit}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Calculating Debt Matrix...</span>
              </>
            ) : (
              <>
                <span>⚡ Calculate Debt Split</span>
              </>
            )}
          </button>

          {/* Results Display */}
          {result && (
            <div className="mt-6 pt-6 border-t border-slate-800 space-y-5 animate-fadeIn">
              {/* Header result info */}
              <div className="flex items-center justify-between p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
                <div>
                  <h3 className="text-sm font-bold text-white">{result.title}</h3>
                  <p className="text-xs text-indigo-300">
                    Paid by <span className="font-semibold text-white">{result.payer_name}</span> • Mode: {result.split_mode.toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Total</span>
                  <p className="text-lg font-bold text-indigo-400">₹{result.total_amount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Participant Shares */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">📊 Individual Shares Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.participants.map(p => (
                    <div key={p.name} className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">{p.name}</span>
                          {p.is_payer && (
                            <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded border border-indigo-500/30">
                              💳 Payer
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">{p.share_percentage}% of total</span>
                      </div>
                      <span className="text-sm font-bold text-slate-200">
                        ₹{p.share_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement Instructions */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">💸 Debt Settlement Matrix</h4>
                {result.settlement_transfers.length === 0 ? (
                  <p className="text-xs text-emerald-400 p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    ✅ No debts owed! Everyone has settled their equal share.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {result.settlement_transfers.map((s, idx) => (
                      <div key={idx} className="p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-center justify-between text-xs text-amber-200">
                        <span>{s.message}</span>
                        <span className="font-bold text-amber-400">
                          ₹{s.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* WhatsApp Summary & Copy */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-slate-300">📲 WhatsApp Shareable Summary</h4>
                  <button
                    onClick={handleCopyWhatsApp}
                    className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                  >
                    {copied ? '✅ Copied!' : '📋 Copy Text'}
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={6}
                  value={result.whatsapp_summary}
                  className="w-full p-3 bg-slate-950 font-mono text-xs text-emerald-400 border border-slate-800 rounded-xl focus:outline-none resize-none"
                />
              </div>

              {/* 1-Click Expense Logging Footer */}
              {onLogPersonalShare && (
                <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-slate-400">Your Share ({result.payer_name === 'You' ? 'You' : 'Calculated'})</span>
                    <p className="text-base font-bold text-emerald-400">
                      ₹{result.user_personal_share.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillExpenseModal}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span>✨ Log My Share as FinTrack Expense</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
