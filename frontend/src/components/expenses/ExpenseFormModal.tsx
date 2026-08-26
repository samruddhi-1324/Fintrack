'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Expense, PaymentMode } from '../../types/expense';
import { useExpenses } from '../../hooks/useExpenses';
import { useCategories } from '../../hooks/useCategories';

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Max 50 characters allowed'),
  category_id: z.string().min(1, 'Please select a category'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
  date: z.string().refine((val) => {
    const selected = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return selected <= today;
  }, 'Transaction date cannot be in the future'),
  notes: z.string().max(250, 'Max 250 characters').optional(),
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
  const { categories } = useCategories();
  const { createExpense, updateExpense, isCreating, isUpdating } = useExpenses();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    if (expenseToEdit) {
      reset({
        title: expenseToEdit.title,
        category_id: expenseToEdit.category_id,
        amount: expenseToEdit.amount,
        date: expenseToEdit.date,
        notes: expenseToEdit.notes || '',
        payment_mode: expenseToEdit.payment_mode
      });
    } else {
      reset({
        title: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        notes: '',
        payment_mode: 'upi'
      });
    }
  }, [expenseToEdit, categories, reset, isOpen]);

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      if (expenseToEdit) {
        await updateExpense({ id: expenseToEdit.id, payload: data as any });
      } else {
        await createExpense(data as any);
      }
      onClose();
    } catch (err: any) {
      setError('title', { message: err.message || 'Failed to save expense' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input
          label="Title / Merchant"
          placeholder="e.g. D-Mart Groceries, Uber Ride"
          {...register('title')}
          error={errors.title?.message}
        />

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Category
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
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)' }}>
                {errors.category_id.message}
              </span>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <Input
              label="Amount (₹)"
              type="number"
              step="0.01"
              placeholder="0.00"
              inputMode="decimal"
              {...register('amount')}
              error={errors.amount?.message}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <Input
              label="Transaction Date"
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
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
              border: '1px solid var(--border-color)',
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
    </Modal>
  );
}
