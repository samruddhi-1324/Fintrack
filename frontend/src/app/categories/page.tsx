'use client';

import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import CategoryList from '../../components/categories/CategoryList';
import CategoryFormModal from '../../components/categories/CategoryFormModal';
import DeleteCategoryModal from '../../components/categories/DeleteCategoryModal';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../types/category';

export default function CategoriesPage() {
  const { categories, isLoading, isError } = useCategories();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  return (
    <ProtectedRoute>
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Category Management</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Organize your spending into custom and starter categories
            </p>
          </div>
          <Button onClick={() => { setCategoryToEdit(null); setIsAddModalOpen(true); }}>
            + Add Category
          </Button>
        </div>

        {isLoading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading categories...</p>
        ) : isError ? (
          <p style={{ color: 'var(--accent-danger)' }}>Failed to load categories. Please check your backend connection.</p>
        ) : (
          <CategoryList
            categories={categories}
            onEdit={(cat) => { setCategoryToEdit(cat); setIsAddModalOpen(true); }}
            onDelete={(cat) => setCategoryToDelete(cat)}
          />
        )}

        {/* Add / Edit Form Modal */}
        <CategoryFormModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          categoryToEdit={categoryToEdit}
        />

        {/* Delete Confirmation & Reassignment Modal */}
        <DeleteCategoryModal
          isOpen={Boolean(categoryToDelete)}
          onClose={() => setCategoryToDelete(null)}
          categoryToDelete={categoryToDelete}
        />
      </main>
    </ProtectedRoute>
  );
}
