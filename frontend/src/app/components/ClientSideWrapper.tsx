// frontend/src/app/components/ClientSideWrapper.tsx

'use client';

import React from "react";
import { useAuth } from "../lib/hooks/useAuth";
import { useModal } from "../lib/hooks/useModal";
import { usePostForm } from "../lib/hooks/usePostForm";
import { LoginModal } from './auth/LoginModal';
import { MicropostModal } from "./microposts/MicropostModal";
import { ApiService } from '../lib/api/apiService';
import { Header } from './layout/Header';

export function ClientSideWrapper({ children }: { children: React.ReactNode }) {
  const { isOpen: isPostModalOpen, handleOpen: handlePostModalOpen, handleClose: handlePostModalClose } = useModal();
  const { isOpen: isLoginModalOpen, handleOpen: handleLoginModalOpen, handleClose: handleLoginModalClose } = useModal();
  const { formTitle, setFormTitle, formContent, setFormContent, formImage, setFormImage, resetForm } = usePostForm();
  const { isLoggedIn, currentUser, login, logout } = useAuth();

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
      handlePostModalClose();
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

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      handleLoginModalClose();
    }
  };

  return (
    <>
      <Header
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        handlePostModalOpen={handlePostModalOpen}
        handleLoginModalOpen={handleLoginModalOpen}
        logout={logout}
      />

      {children}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
        onLogin={handleLogin}
      />

      <MicropostModal
        isOpen={isPostModalOpen}
        onClose={handlePostModalClose}
        onSubmit={handleSubmitPost}
        title={formTitle}
        setTitle={setFormTitle}
        content={formContent}
        setContent={setFormContent}
        image={formImage}
        onImageChange={handleImageChange}
      />
    </>
  );
}