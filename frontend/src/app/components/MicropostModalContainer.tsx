// MicropostModalContainer.tsx
import React from "react";
import { usePostForm } from "../lib/hooks/usePostForm";
import { ApiService } from '../lib/api/apiService';
import { MicropostModal } from "./microposts/MicropostModal";

type MicropostModalContainerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MicropostModalContainer({ isOpen, onClose }: MicropostModalContainerProps) {
  const { formTitle, setFormTitle, formContent, setFormContent, formImage, setFormImage, resetForm } = usePostForm();

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user) {
      console.error('User not found');
      return;
    }
    formData.append('userId', user.id.toString());
    formData.append('title', formTitle);
    formData.append('content', formContent);
    if (formImage) {
      formData.append('image', formImage);
    }

    try {
      await ApiService.createMicropost(formData);
      onClose();
      resetForm();
      location.reload();
    } catch (err) {
      console.error('Error creating micropost:', err);
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
      content={formContent}
      setContent={setFormContent}
      image={formImage}
      onImageChange={handleImageChange}
    />
  );
}