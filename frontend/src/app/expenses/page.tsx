'use client';

import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import ExpenseFiltersBar from '../../components/expenses/ExpenseFiltersBar';
import ExpenseListTable from '../../components/expenses/ExpenseListTable';
import ExpensePagination from '../../components/expenses/ExpensePagination';
import ExpenseFormModal from '../../components/expenses/ExpenseFormModal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useExpenses } from '../../hooks/useExpenses';
import { Expense, ExpenseFilterParams } from '../../types/expense';

export default function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilterParams>({ page: 1, limit: 15 });
  const { expenses, meta, isLoading, isError, deleteExpense, isDeleting } = useExpenses(filters);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const handleExportCSV = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    window.open(`${apiBase}/export?format=csv`, '_blank');
  };

  return (
    <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Expense Log</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Review, search, filter, and export your personal transactions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={handleExportCSV}>
            📥 Export CSV
          </Button>
          <Button onClick={() => { setExpenseToEdit(null); setIsAddModalOpen(true); }}>
            + Log Expense
          </Button>
        </div>
      </div>

      {/* Combined Search, Filter & Sort Controls */}
      <ExpenseFiltersBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ page: 1, limit: 15 })}
      />

      {/* Expense List Data Table */}
      {isLoading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading expenses...</p>
      ) : isError ? (
        <p style={{ color: 'var(--accent-danger)' }}>Failed to load expenses. Check backend connection.</p>
      ) : (
        <>
          <ExpenseListTable
            expenses={expenses}
            onEdit={(exp) => { setExpenseToEdit(exp); setIsAddModalOpen(true); }}
            onDelete={(exp) => setExpenseToDelete(exp)}
          />
          <ExpensePagination
            page={meta.page}
            totalPages={meta.total_pages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={(newPage) => setFilters({ ...filters, page: newPage })}
          />
        </>
      )}

      {/* Add / Edit Form Modal */}
      <ExpenseFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        expenseToEdit={expenseToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        onClose={() => setExpenseToDelete(null)}
        onConfirm={async () => {
          if (expenseToDelete) {
            await deleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
        title="Delete Expense"
        message={`Are you sure you want to delete "${expenseToDelete?.title}" (${expenseToDelete?.amount} ₹)?`}
        isLoading={isDeleting}
      />
    </main>
  );
}
