'use client';

import React, { useState, useEffect, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { aiApi } from '../../services/aiApi';
import { NaturalLanguageExpenseResponse } from '../../types/ai';
import { useCategories } from '../../hooks/useCategories';
import { useExpenses } from '../../hooks/useExpenses';
import { Mic, MicOff, Sparkles, RefreshCw, AlertCircle, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceParsed?: (data: {
    title: string;
    amount: number;
    payment_mode: 'cash' | 'card' | 'upi';
    category_id?: string;
    date?: string;
    notes?: string;
  }) => void;
}

export const VoiceLoggerModal: React.FC<VoiceLoggerModalProps> = ({
  isOpen,
  onClose,
  onVoiceParsed
}) => {
  const { categories } = useCategories();
  const { createExpense, isCreating } = useExpenses();

  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<NaturalLanguageExpenseResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable result fields
  const [editableTitle, setEditableTitle] = useState<string>('');
  const [editableAmount, setEditableAmount] = useState<string>('');
  const [editableCategory, setEditableCategory] = useState<string>('');
  const [editablePaymentMode, setEditablePaymentMode] = useState<'cash' | 'card' | 'upi'>('upi');

  const recognitionRef = useRef<any>(null);

  const resetState = () => {
    stopListening();
    setIsListening(false);
    setTranscript('');
    setIsParsing(false);
    setParseResult(null);
    setErrorMsg(null);
    setEditableTitle('');
    setEditableAmount('');
    setEditableCategory('');
    setEditablePaymentMode('upi');
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  // Initialize Speech Recognition API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;
        recog.lang = 'en-IN'; // Indian English context

        recog.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recog.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error !== 'no-speech') {
            setErrorMsg(`Voice input error: ${event.error}. You can also type your sentence below.`);
          }
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, []);

  // Auto-start microphone when modal opens
  useEffect(() => {
    if (isOpen) {
      resetState();
      // Short delay before auto-starting mic
      const t = setTimeout(() => {
        startListening();
      }, 300);
      return () => clearTimeout(t);
    } else {
      resetState();
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg(null);
    setParseResult(null);
    setTranscript('');

    if (!recognitionRef.current) {
      setErrorMsg('Web Speech API is not supported in this browser. Please type your phrase below.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      // Mic might already be running
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  // Parse speech transcript via AI NLP Backend
  const handleParseTranscript = async (textToParse?: string) => {
    const text = textToParse || transcript;
    if (!text || !text.trim()) {
      setErrorMsg('Please speak or type an expense phrase first (e.g., "Paid 350 for dinner via UPI").');
      return;
    }

    stopListening();
    setIsParsing(true);
    setErrorMsg(null);

    try {
      const res = await aiApi.parseExpenseNLP(text.trim());
      setParseResult(res);
      setEditableTitle(res.title || 'Expense');
      setEditableAmount(res.amount > 0 ? String(res.amount) : '');
      setEditablePaymentMode((res.payment_mode as any) || 'upi');

      let matchedCatId = res.category_id || '';
      if (!matchedCatId && res.category) {
        const matched = categories.find(
          (c) => c.name.toLowerCase() === res.category?.toLowerCase() ||
                 c.name.toLowerCase().includes(res.category?.toLowerCase() || '')
        );
        if (matched) matchedCatId = matched.id;
      }
      setEditableCategory(matchedCatId || (categories.length > 0 ? categories[0].id : ''));

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to parse voice transcript. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const cleanAmountString = (val: string | number | undefined | null): number => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    const sanitized = String(val).replace(/,/g, '').replace(/[^\d.]/g, '');
    const parsed = parseFloat(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleAutoFillForm = () => {
    if (!parseResult) return;

    const parsedAmt = cleanAmountString(editableAmount);
    const finalAmount = parsedAmt > 0 ? parsedAmt : parseResult.amount;
    const finalTitle = editableTitle.trim() || parseResult.title;
    const finalCatId = editableCategory || (categories.length > 0 ? categories[0].id : undefined);

    if (onVoiceParsed) {
      onVoiceParsed({
        title: finalTitle,
        amount: finalAmount,
        payment_mode: editablePaymentMode,
        category_id: finalCatId,
        date: new Date().toISOString().split('T')[0],
        notes: `Voice Logged: "${transcript}"`
      });
    }

    handleModalClose();
  };

  const handleCreateImmediately = async () => {
    if (!parseResult) return;

    const parsedAmt = cleanAmountString(editableAmount);
    const finalAmount = parsedAmt > 0 ? parsedAmt : parseResult.amount;
    const finalTitle = editableTitle.trim() || parseResult.title;
    const finalCatId = editableCategory || (categories.length > 0 ? categories[0].id : '');

    if (finalAmount <= 0) {
      setErrorMsg('Please enter a valid expense amount greater than 0.');
      return;
    }

    try {
      await createExpense({
        title: finalTitle,
        amount: finalAmount,
        category_id: finalCatId,
        date: new Date().toISOString().split('T')[0],
        payment_mode: editablePaymentMode,
        notes: `AI Voice Quick-Add: "${transcript}"`
      });
      handleModalClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to log expense immediately.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="🎙️ AI Voice Hands-Free Expense Logger"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner Header */}
        <div
          style={{
            padding: '0.875rem 1rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              padding: '0.5rem',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Speak Naturally to Log Expenses
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Say e.g., <em>"Spent 450 rupees for Starbucks coffee using UPI"</em> or <em>"Taxi 300 cash"</em>.
            </div>
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--accent-danger)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-danger)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Microphone Audio Pulse Area */}
        <div
          style={{
            padding: '2rem 1.5rem',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-secondary)',
            border: isListening ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            disabled={isParsing}
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.2)',
              border: isListening ? '2px solid var(--accent-danger)' : '2px solid var(--accent-primary)',
              color: isListening ? 'var(--accent-danger)' : 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
            {isListening && (
              <motion.div
                animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0.1, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                style={{
                  position: 'absolute',
                  inset: '-8px',
                  borderRadius: '50%',
                  border: '2px solid var(--accent-danger)'
                }}
              />
            )}
          </button>

          <div>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isListening ? '🎙️ Listening... Speak your expense now!' : 'Click Microphone to Start Speaking'}
            </span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
              {isListening ? 'Click again to stop recording' : 'Supports English & Hinglish voice input'}
            </div>
          </div>

          {/* Transcript Preview Input */}
          <div style={{ width: '100%', marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Spoken transcript will appear here (or type manually)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleParseTranscript();
                }
              }}
              style={{
                flex: 1,
                padding: '0.6rem 0.85rem',
                fontSize: '0.9rem',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}
            />
            <Button
              type="button"
              onClick={() => handleParseTranscript()}
              isLoading={isParsing}
              disabled={isParsing || !transcript.trim()}
            >
              <Sparkles size={15} /> Parse AI
            </Button>
          </div>
        </div>

        {/* Parsed Result Fields Grid */}
        {parseResult && (
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-success)', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} /> AI NLP Extracted Details:
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Title / Merchant
                </label>
                <input
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  placeholder="Merchant Title"
                  style={{
                    width: '100%',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginTop: '0.25rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.45rem 0.65rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editableAmount}
                  onChange={(e) => setEditableAmount(e.target.value)}
                  placeholder="Amount (₹)"
                  style={{
                    width: '100%',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--accent-success)',
                    marginTop: '0.25rem',
                    backgroundColor: 'var(--bg-card)',
                    border: editableAmount === '' || Number(editableAmount) === 0 ? '1px solid var(--accent-warning)' : '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.45rem 0.65rem'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Category
                </label>
                <select
                  value={editableCategory}
                  onChange={(e) => setEditableCategory(e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginTop: '0.25rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.45rem 0.65rem'
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Payment Mode
                </label>
                <select
                  value={editablePaymentMode}
                  onChange={(e) => setEditablePaymentMode(e.target.value as any)}
                  style={{
                    width: '100%',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginTop: '0.25rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.45rem 0.65rem'
                  }}
                >
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="cash">Cash / Notes</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <Button type="button" variant="secondary" onClick={() => startListening()}>
                <Mic size={15} /> Speak Again
              </Button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onVoiceParsed && (
                  <Button type="button" variant="secondary" onClick={handleAutoFillForm}>
                    <FileText size={15} /> Fill Form
                  </Button>
                )}
                <Button type="button" onClick={handleCreateImmediately} isLoading={isCreating}>
                  Log Expense <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VoiceLoggerModal;
