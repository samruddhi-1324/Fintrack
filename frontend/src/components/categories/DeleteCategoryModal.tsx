'use client';

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Category } from '../../types/category';
import { useCategories } from '../../hooks/useCategories';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToDelete: Category | null;
}

export default function DeleteCategoryModal({
  isOpen,
  onClose,
  categoryToDelete
}: DeleteCategoryModalProps) {
  const { categories, deleteCategory, isDeleting } = useCategories();
  const [reassignId, setReassignId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!categoryToDelete) return null;

  const expenseCount = categoryToDelete.expense_count || 0;
  const otherCategories = categories.filter((c) => c.id !== categoryToDelete.id);

  const handleDelete = async () => {
    setErrorMsg('');
    if (expenseCount > 0 && !reassignId) {
      setErrorMsg('Please select a category to reassign existing expenses to before deleting.');
      return;
    }

    try {
      await deleteCategory({
        id: categoryToDelete.id,
        reassign_to_category_id: reassignId || undefined
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete category');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Delete "${categoryToDelete.name}"`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {expenseCount > 0
            ? `This category is linked to ${expenseCount} expense(s). Reassign them to another category to proceed.`
            : `Are you sure you want to delete category "${categoryToDelete.name}"? This action cannot be undone.`}
        </p>

        {expenseCount > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Reassign Expenses To:
            </label>
            <select
              value={reassignId}
              onChange={(e) => setReassignId(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.625rem 0.875rem',
                fontSize: '0.875rem',
                outline: 'none',
                minHeight: '44px'
              }}
            >
              <option value="">-- Select Reassignment Category --</option>
              {otherCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {errorMsg && (
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-danger)' }}>{errorMsg}</span>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
            Delete Category
          </Button>
        </div>
      </div>
    </Modal>
  );
}
