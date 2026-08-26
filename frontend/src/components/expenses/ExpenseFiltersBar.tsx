'use client';

import React from 'react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { ExpenseFilterParams, PaymentMode } from '../../types/expense';
import { useCategories } from '../../hooks/useCategories';

interface ExpenseFiltersBarProps {
  filters: ExpenseFilterParams;
  onFilterChange: (newFilters: ExpenseFilterParams) => void;
  onReset: () => void;
}

export default function ExpenseFiltersBar({
  filters,
  onFilterChange,
  onReset
}: ExpenseFiltersBarProps) {
  const { categories } = useCategories();

  return (
    <Card style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* Search */}
        <Input
          label="Search Title / Notes"
          placeholder="e.g. Groceries..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value, page: 1 })}
        />

        {/* Category */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Category
          </label>
          <select
            value={filters.category_id || ''}
            onChange={(e) => onFilterChange({ ...filters, category_id: e.target.value || undefined, page: 1 })}
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
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <Input
          label="Start Date"
          type="date"
          value={filters.start_date || ''}
          onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value || undefined, page: 1 })}
        />

        {/* End Date */}
        <Input
          label="End Date"
          type="date"
          value={filters.end_date || ''}
          onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value || undefined, page: 1 })}
        />

        {/* Payment Mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Payment Mode
          </label>
          <select
            value={filters.payment_mode || ''}
            onChange={(e) => onFilterChange({ ...filters, payment_mode: (e.target.value as PaymentMode) || undefined, page: 1 })}
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
            <option value="">All Payment Modes</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        {/* Sort By */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
            Sort By
          </label>
          <select
            value={`${filters.sort_by || 'date'}-${filters.order || 'desc'}`}
            onChange={(e) => {
              const [sort_by, order] = e.target.value.split('-') as [any, any];
              onFilterChange({ ...filters, sort_by, order, page: 1 });
            }}
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
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="amount-desc">Amount (Highest First)</option>
            <option value="amount-asc">Amount (Lowest First)</option>
            <option value="category-asc">Category Name (A-Z)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <Button variant="secondary" size="sm" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </Card>
  );
}
