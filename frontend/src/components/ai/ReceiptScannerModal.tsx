'use client';

import React, { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { aiApi } from '../../services/aiApi';
import { ReceiptScanResponse } from '../../types/ai';
import { useCategories } from '../../hooks/useCategories';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency } from '../../lib/formatters';
import { Camera, Sparkles, RefreshCw, CheckCircle2, AlertCircle, ShoppingBag, FileText, ArrowRight } from 'lucide-react';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned?: (data: {
    title: string;
    amount: number;
    payment_mode: 'cash' | 'card' | 'upi';
    category_id?: string;
    date?: string;
    notes?: string;
  }) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptScanned
}) => {
  const { categories } = useCategories();
  const { createExpense, isCreating } = useExpenses();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ReceiptScanResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable result fields
  const [editableAmount, setEditableAmount] = useState<string>('');
  const [editableMerchant, setEditableMerchant] = useState<string>('');
  const [editableCategory, setEditableCategory] = useState<string>('');
  const [editableDate, setEditableDate] = useState<string>('');

  const resetState = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setIsScanning(false);
    setScanResult(null);
    setErrorMsg(null);
    setEditableAmount('');
    setEditableMerchant('');
    setEditableCategory('');
    setEditableDate('');
  };

  const handleModalClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid receipt image file (JPEG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 10 MB limit.');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleScanReceipt = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setErrorMsg(null);

    try {
      const result = await aiApi.scanReceipt(selectedFile);
      setScanResult(result);
      setEditableAmount(result.amount > 0 ? String(result.amount) : '');
      setEditableMerchant(result.merchant || 'Receipt Store');

      let matchedCatId = result.category_id || '';
      if (!matchedCatId && result.category) {
        const matched = categories.find(
          (c) => c.name.toLowerCase() === result.category.toLowerCase() ||
                 c.name.toLowerCase().includes(result.category.toLowerCase()) ||
                 result.category.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matched) matchedCatId = matched.id;
      }
      setEditableCategory(matchedCatId || (categories.length > 0 ? categories[0].id : ''));
      setEditableDate(result.date ? (result.date.includes('T') ? result.date.split('T')[0] : result.date) : new Date().toISOString().split('T')[0]);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to scan receipt image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutoFillForm = () => {
    if (!scanResult) return;

    const finalAmount = Number(editableAmount) > 0 ? Number(editableAmount) : scanResult.amount;
    const finalMerchant = editableMerchant.trim() || scanResult.merchant;
    const finalCatId = editableCategory || (categories.length > 0 ? categories[0].id : undefined);
    const finalDate = editableDate || new Date().toISOString().split('T')[0];

    if (onReceiptScanned) {
      onReceiptScanned({
        title: finalMerchant,
        amount: finalAmount,
        payment_mode: scanResult.payment_mode || 'card',
        category_id: finalCatId,
        date: finalDate,
        notes: scanResult.raw_text ? `Scanned via AI OCR: ${finalMerchant}` : undefined
      });
    }

    handleModalClose();
  };

  const handleCreateImmediately = async () => {
    if (!scanResult) return;

    const finalAmount = Number(editableAmount) > 0 ? Number(editableAmount) : scanResult.amount;
    const finalMerchant = editableMerchant.trim() || scanResult.merchant;
    const finalCatId = editableCategory || (categories.length > 0 ? categories[0].id : '');
    const finalDate = editableDate || new Date().toISOString().split('T')[0];

    if (finalAmount <= 0) {
      setErrorMsg('Please enter a valid expense amount greater than 0.');
      return;
    }

    try {
      await createExpense({
        title: finalMerchant,
        amount: finalAmount,
        category_id: finalCatId,
        date: finalDate,
        payment_mode: scanResult.payment_mode || 'card',
        notes: `Smart AI Receipt OCR Scan`
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
      title="Smart AI Receipt Scanner & OCR"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Banner Header */}
        <div
          style={{
            padding: '0.875rem 1rem',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
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
              AI Vision OCR Receipt Extraction
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Upload any receipt photo to instantly extract Merchant, Total Amount, Date, and Category.
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

        {/* Dropzone Area */}
        {!selectedFile && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && e.target.files[0] && handleFileSelect(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Camera size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Click to upload or drag receipt photo
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                Supports JPEG, PNG, WEBP (Max 10 MB)
              </div>
            </div>
          </div>
        )}

        {/* Image Preview & Scan Action */}
        {selectedFile && !scanResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                maxHeight: '220px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Receipt Preview"
                  style={{ maxHeight: '220px', objectFit: 'contain', width: '100%' }}
                />
              )}
              {isScanning && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    color: '#fff'
                  }}
                >
                  <RefreshCw className="animate-spin" size={32} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    AI Vision scanning & parsing OCR data...
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                disabled={isScanning}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Choose a different photo
              </button>

              <Button
                type="button"
                onClick={handleScanReceipt}
                isLoading={isScanning}
                disabled={isScanning}
              >
                <Sparkles size={16} /> Analyze Receipt
              </Button>
            </div>
          </div>
        )}

        {/* Scan Results Card */}
        {scanResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {scanResult.provider === 'rule_based' && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>💡</span>
                <span>
                  <strong>Offline OCR Fallback Active:</strong> Add <code>GEMINI_API_KEY</code> to <code>backend/.env</code> for full multi-modal AI receipt reading. Verify or edit details below:
                </span>
              </div>
            )}

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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Merchant / Title
                  </label>
                  <input
                    type="text"
                    value={editableMerchant}
                    onChange={(e) => setEditableMerchant(e.target.value)}
                    placeholder="Merchant Name"
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
                    placeholder="Enter amount (₹)"
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
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={editableDate}
                    onChange={(e) => setEditableDate(e.target.value)}
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
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <div
                  style={{
                    padding: '0.35rem 0.65rem',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--accent-success)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <CheckCircle2 size={12} /> AI Confidence: {Math.round(scanResult.confidence * 100)}%
                </div>

                <div
                  style={{
                    padding: '0.35rem 0.65rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  Payment Mode: {scanResult.payment_mode.toUpperCase()}
                </div>
              </div>

              {scanResult.line_items && scanResult.line_items.length > 0 && (
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                    Extracted Line Items:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '100px', overflowY: 'auto' }}>
                    {scanResult.line_items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'var(--bg-card)',
                          borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <span>{item.name}</span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Button type="button" variant="secondary" onClick={resetState}>
                Scan Another
              </Button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onReceiptScanned && (
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

export default ReceiptScannerModal;
