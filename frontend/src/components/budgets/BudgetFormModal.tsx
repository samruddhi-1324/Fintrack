'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useBudgets } from '../../hooks/useBudgets';
import { useCategories } from '../../hooks/useCategories';

const budgetSchema = z.object({
  category_id: z.string().optional(),
  amount: z.coerce.number().positive('Budget amount must be a positive number')
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategoryId?: string;
  initialAmount?: number;
}

export default function BudgetFormModal({
  isOpen,
  onClose,
  initialCategoryId,
  initialAmount
}: BudgetFormModalProps) {
  const { categories } = useCategories();
  const { setBudget, isSetting } = useBudgets();

  const [formError, setFormError] = React.useState<string>('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors }
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: initialCategoryId || '',
      amount: initialAmount || 10000
    }
  });

  useEffect(() => {
    setFormError('');
    if (isOpen) {
      const catId = initialCategoryId || '';
      const amt = initialAmount || 10000;
      reset({
        category_id: catId,
        amount: amt
      });
      setValue('category_id', catId);
      setValue('amount', amt as any);
    }
  }, [isOpen, initialCategoryId, initialAmount, reset, setValue]);

  const onSubmit = async (data: BudgetFormData) => {
    setFormError('');
    try {
      await setBudget({
        category_id: data.category_id && data.category_id.trim().length > 0 ? data.category_id : null,
        amount: Number(data.amount),
        period: 'monthly'
      });
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save budget goal. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Monthly Spending Budget">
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Target Budget Scope
          </label>
          <select
            {...register('category_id')}
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
            <option value="">🎯 Overall Monthly Budget Limit</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                Category: {cat.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Monthly Budget Amount (₹)"
          type="number"
          step="0.01"
          placeholder="e.g. 25000.00"
          inputMode="decimal"
          {...register('amount')}
          error={errors.amount?.message}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSetting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSetting}>
            Set Budget Goal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
