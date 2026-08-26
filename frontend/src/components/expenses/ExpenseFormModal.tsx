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

const expenseSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(50, 'Max 50 characters allowed')
    .refine((val) => val.trim().length > 0, 'Title cannot be empty or whitespace only'),
  category_id: z.string().uuid('Please select a valid category'),
  amount: z
    .coerce
    .number({ invalid_type_error: 'Amount must be a valid number' })
    .gt(0, 'Amount must be greater than 0'),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((val) => {
      if (!val) return false;
      const todayStr = new Date().toISOString().split('T')[0];
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: '',
      category_id: '',
      amount: '' as any,
      date: new Date().toISOString().split('T')[0],
      notes: '',
      payment_mode: 'upi'
    }
  });

  useEffect(() => {
    setFormError('');
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
          date: new Date().toISOString().split('T')[0],
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
        category_id: data.category_id,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Category *
            </label>
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
          <Button type="submit" isLoading={isCreating || isUpdating} disabled={categories.length === 0}>
            {expenseToEdit ? 'Save Changes' : 'Log Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
