'use client'

import React, { useState, useEffect } from "react";
import { usePostForm } from "../../hooks/usePostForm";
import { MicropostModal } from "../microposts/MicropostModal";
import { createMicropost } from "../../actions/microposts";
import { getCategories } from "../../actions/categories";
import { useRouter } from 'next/navigation';

type MicropostModalContainerProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Category = {
  id: number;
  title: string;
};

export function MicropostModalContainer({ isOpen, onClose }: MicropostModalContainerProps) {
  const { formTitle, setFormTitle, formImage, setFormImage, resetForm } = usePostForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchCategories() {
      const result = await getCategories();
      if (Array.isArray(result)) {
        setAvailableCategories(result);
      } else {
        setError('Failed to fetch categories');
      }
    }
    fetchCategories();
  }, []);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user) {
      setError('User not found');
      setIsSubmitting(false);
      return;
    }
    formData.append('userId', user.id.toString());
    formData.append('title', formTitle);
    if (formImage) {
      formData.append('image', formImage);
    }
    selectedCategoryIds.forEach((categoryId) => {
      formData.append('categoryIds[]', categoryId.toString());
    });

    try {
      const result = await createMicropost(formData);
      if (result.success) {
        resetForm();
        setSelectedCategoryIds([]);
        onClose();
        router.refresh();
      } else {
        setError(result.error || 'Failed to create micropost');
      }
    } catch (err) {
      setError('An error occurred while creating the micropost');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormImage(e.target.files[0]);
    }
  };

  return (
    <MicropostModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmitPost}
      title={formTitle}
      setTitle={setFormTitle}
      image={formImage}
      onImageChange={handleImageChange}
      isLoading={isSubmitting}
      error={error}
      selectedCategoryIds={selectedCategoryIds}
      setSelectedCategoryIds={setSelectedCategoryIds}
      availableCategories={availableCategories}
    />
  );
}