'use client'

import React, { useState } from "react";
import { usePostForm } from "../../hooks/usePostForm";
import { MicropostModal } from "../microposts/MicropostModal";
import { createMicropost } from "../../actions/createMicropost";
import { useRouter } from 'next/navigation';

type MicropostModalContainerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MicropostModalContainer({ isOpen, onClose }: MicropostModalContainerProps) {
  const { formTitle, setFormTitle, formImage, setFormImage, resetForm } = usePostForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

    try {
      const result = await createMicropost(formData);
      if (result.success) {
        resetForm();
        onClose();
        router.refresh(); // Refresh the current page to show the new micropost
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
    />
  );
}