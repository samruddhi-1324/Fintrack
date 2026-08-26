'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Category } from '../../types/category';
import { useCategories } from '../../hooks/useCategories';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(30, 'Max 30 characters allowed')
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  categoryToEdit
}: CategoryFormModalProps) {
  const { createCategory, updateCategory, isCreating, isUpdating } = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema)
  });

  useEffect(() => {
    if (categoryToEdit) {
      reset({ name: categoryToEdit.name });
    } else {
      reset({ name: '' });
    }
  }, [categoryToEdit, reset, isOpen]);

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (categoryToEdit) {
        await updateCategory({ id: categoryToEdit.id, payload: data });
      } else {
        await createCategory(data);
      }
      onClose();
    } catch (err: any) {
      setError('name', { message: err.message || 'Failed to save category' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryToEdit ? 'Edit Category' : 'Add New Category'}
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          label="Category Name"
          placeholder="e.g. Health, Subscriptions"
          {...register('name')}
          error={errors.name?.message}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isCreating || isUpdating}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isCreating || isUpdating}>
            {categoryToEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
