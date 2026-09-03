'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Expense } from '../../types/expense';
import { useExpenses } from '../../hooks/useExpenses';
import { useCategories } from '../../hooks/useCategories';
import { getTodayLocalDateString } from '../../lib/formatters';
import { aiApi } from '../../services/aiApi';
import { Sparkles, Wand2, Camera } from 'lucide-react';
import { ReceiptScannerModal } from '../ai/ReceiptScannerModal';

const expenseSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(1, 'Title is required')
    .max(50, 'Max 50 characters allowed')
    .refine((val) => val.trim().length > 0, 'Title cannot be empty or whitespace only'),
  category_id: z.string().min(1, 'Please select a category'),
  amount: z
    .coerce
    .number({ invalid_type_error: 'Amount must be a valid number' })
    .gt(0, 'Amount must be greater than 0'),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => {
      if (!val) return false;
      const todayStr = getTodayLocalDateString();
      return val <= todayStr;
    }, 'Transaction date cannot be in the future'),
  notes: z
    .string()
    .max(250, 'Notes cannot exceed 250 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  payment_mode: z.enum(['cash', 'card', 'upi']).optional()
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export default function ExpenseFormModal({
  isOpen,
  onClose,
  expenseToEdit
}: ExpenseFormModalProps) {
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { createExpense, updateExpense, isCreating, isUpdating } = useExpenses();
  const [formError, setFormError] = useState<string>('');
  
  // AI NLP, OCR & Smart Suggestion States
  const [nlpInput, setNlpInput] = useState<string>('');
  const [isParsingNlp, setIsParsingNlp] = useState<boolean>(false);
  const [aiSuggestedCat, setAiSuggestedCat] = useState<string | null>(null);
  const [isSuggestingCat, setIsSuggestingCat] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      category_id: '',
      amount: '' as any,
      date: getTodayLocalDateString(),
      notes: '',
      payment_mode: 'upi'
    }
  });

  const currentTitle = watch('title');

  // Handle AI Quick-Add Sentence Parsing
  const handleQuickAddNLP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;

    setIsParsingNlp(true);
    setFormError('');
    try {
      const parsed = await aiApi.parseExpenseNLP(nlpInput.trim());
      if (parsed.title) setValue('title', parsed.title, { shouldValidate: true });
      if (parsed.amount > 0) setValue('amount', parsed.amount as any, { shouldValidate: true });
      if (parsed.payment_mode) setValue('payment_mode', parsed.payment_mode, { shouldValidate: true });

      // Match category ID if returned or suggest
      if (parsed.category_id) {
        setValue('category_id', parsed.category_id, { shouldValidate: true });
      } else if (parsed.category) {
        const matched = categories.find((c) => c.name.toLowerCase() === parsed.category?.toLowerCase());
        if (matched) {
          setValue('category_id', matched.id, { shouldValidate: true });
        }
      }
      setNlpInput('');
    } catch (err) {
      console.warn('AI Quick Add parse failed, fallback available.');
    } finally {
      setIsParsingNlp(false);
    }
  };

  // Trigger Smart Category Suggestion from Title
  const handleAutoSuggestCategory = async () => {
    if (!currentTitle || currentTitle.trim().length < 2) return;
    setIsSuggestingCat(true);
    try {
      const res = await aiApi.categorize(currentTitle.trim());
      if (res && res.category) {
        setAiSuggestedCat(res.category);
        const matched = categories.find(
          (c) => c.name.toLowerCase() === res.category.toLowerCase() ||
                 c.name.toLowerCase().includes(res.category.toLowerCase())
        );
        if (matched) {
          setValue('category_id', matched.id, { shouldValidate: true });
        }
      }
    } catch (e) {
      console.warn('Auto categorize failed:', e);
    } finally {
      setIsSuggestingCat(false);
    }
  };

  useEffect(() => {
    setFormError('');
    setAiSuggestedCat(null);
    setNlpInput('');
    if (isOpen) {
      if (expenseToEdit) {
        reset({
          title: expenseToEdit.title,
          category_id: expenseToEdit.category_id,
          amount: expenseToEdit.amount,
          date: expenseToEdit.date,
          notes: expenseToEdit.notes || '',
          payment_mode: (expenseToEdit.payment_mode as any) || 'upi'
        });
      } else {
        reset({
          title: '',
          category_id: categories.length > 0 ? categories[0].id : '',
          amount: '' as any,
          date: getTodayLocalDateString(),
          notes: '',
          payment_mode: 'upi'
        });
      }
    }
  }, [expenseToEdit, categories, reset, isOpen]);

  // Sync category_id when categories load asynchronously
  useEffect(() => {
    if (categories.length > 0 && !expenseToEdit) {
      setValue('category_id', categories[0].id, { shouldValidate: true });
    }
  }, [categories, expenseToEdit, setValue]);

  const onSubmit = async (data: ExpenseFormData) => {
    setFormError('');
    try {
      const payload = {
        title: data.title.trim(),
        category_id: data.category_id || (categories.length > 0 ? categories[0].id : ''),
        amount: Number(data.amount),
        date: data.date,
        notes: data.notes && data.notes.trim().length > 0 ? data.notes.trim() : undefined,
        payment_mode: data.payment_mode || 'upi'
      };

      if (expenseToEdit) {
        await updateExpense({ id: expenseToEdit.id, payload: payload as any });
      } else {
        await createExpense(payload as any);
      }
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save expense. Please check input details.');
    }
  };

  const onInvalid = (invalidErrors: any) => {
    console.log('Form Validation Errors:', invalidErrors);
    const errorKeys = Object.keys(invalidErrors);
    if (errorKeys.length > 0) {
      const firstMsg = invalidErrors[errorKeys[0]]?.message;
      setFormError(`Validation Check: ${firstMsg || 'Please fill in all required fields marked with *'}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* AI Smart Quick Add Natural Language & Receipt Scanner Bar */}
        {!expenseToEdit && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12))',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Sparkles size={14} /> AI Smart Quick-Add
              </span>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.25rem 0.5rem',
                  color: 'var(--accent-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Camera size={13} /> 📷 Scan Receipt OCR
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={nlpInput}
                onChange={(e) => setNlpInput(e.target.value)}
                placeholder="e.g. Domino's pizza 650 with card"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleQuickAddNLP(e);
                  }
                }}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              />
              <button
                type="button"
                onClick={(e) => handleQuickAddNLP(e)}
                disabled={isParsingNlp || !nlpInput.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: isParsingNlp || !nlpInput.trim() ? 0.6 : 1
                }}
              >
                <Wand2 size={13} /> {isParsingNlp ? 'Parsing...' : 'Fill'}
              </button>
            </div>
          </div>
        )}


        <form onSubmit={handleSubmit(onSubmit, onInvalid)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid var(--accent-danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-danger)',
                fontSize: '0.875rem'
              }}
            >
              ⚠️ {formError}
            </div>
          )}

          <Input
            label="Title / Merchant *"
            placeholder="e.g. D-Mart Groceries, Uber Ride"
            {...register('title')}
            error={errors.title?.message}
          />

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Category *
                </label>
                {currentTitle && currentTitle.trim().length > 1 && (
                  <button
                    type="button"
                    onClick={handleAutoSuggestCategory}
                    disabled={isSuggestingCat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <Sparkles size={11} /> {isSuggestingCat ? 'Matching...' : 'AI Suggest'}
                  </button>
                )}
              </div>
              <select
                {...register('category_id')}
                disabled={isCategoriesLoading || categories.length === 0}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: errors.category_id ? '1px solid var(--accent-danger)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.875rem',
                  minHeight: '44px'
                }}
              >
                {categories.length === 0 ? (
                  <option value="">{isCategoriesLoading ? 'Loading categories...' : 'No categories available'}</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
              {aiSuggestedCat && (
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)' }}>
                  ✨ AI Matched: {aiSuggestedCat}
                </span>
              )}
              {errors.category_id && (
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)' }}>
                  {errors.category_id.message}
                </span>
              )}
            </div>

          <div style={{ flex: 1, minWidth: '180px' }}>
            <Input
              label="Amount (₹) *"
              type="number"
              step="0.01"
              placeholder="e.g. 450.00"
              inputMode="decimal"
              {...register('amount')}
              error={errors.amount?.message}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px' }}>
            <Input
              label="Transaction Date *"
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
          </div>

          <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Payment Mode
            </label>
            <select
              {...register('payment_mode')}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.625rem 0.875rem',
                fontSize: '0.875rem',
                minHeight: '44px'
              }}
            >
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Add any extra transaction notes..."
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: errors.notes ? '1px solid var(--accent-danger)' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.625rem 0.875rem',
              fontSize: '0.875rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
          {errors.notes && (
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)' }}>
              {errors.notes.message}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isCreating || isUpdating}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating || isUpdating}>
            {expenseToEdit ? 'Save Changes' : 'Log Expense'}
          </Button>
        </div>
      </form>
      </div>

      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onReceiptScanned={(data) => {
          if (data.title) {
            setValue('title', data.title, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          }
          if (data.amount !== undefined && data.amount !== null) {
            const parsed = typeof data.amount === 'number' ? data.amount : parseFloat(String(data.amount).replace(/,/g, '').replace(/[^\d.]/g, ''));
            if (!isNaN(parsed) && parsed > 0) {
              setValue('amount', parsed as any, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
            }
          }
          if (data.payment_mode) {
            setValue('payment_mode', data.payment_mode, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          }
          if (data.category_id) {
            setValue('category_id', data.category_id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          }
          if (data.date) {
            setValue('date', data.date, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          }
          if (data.notes) {
            setValue('notes', data.notes, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          }
        }}
      />
    </Modal>
  );
}

