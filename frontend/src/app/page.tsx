// frontend\src\app\page.tsx

'use client';

import React from "react";
import { ApiService } from './api/apiService';
import {LoadingSpinner} from "./components/common/LoadingSpinner";
import {ErrorMessage} from "./components/common/ErrorMessage";
import { useAuth } from "./hooks/useAuth";
import { useModal } from "./hooks/useModal";
import { useMicroposts } from "./hooks/useMicroposts";
import { usePostForm } from "./hooks/usePostForm";
import { MicropostList } from "./components/MicropostList";
import {LoginModal} from './components/LoginModal';
import { MicropostModal } from "./components/MicropostModal";

export default function Home() {
  const { microposts, isLoading, error, addMicropost, fetchMicroposts } = useMicroposts();
  const { isOpen: isPostModalOpen, handleOpen: handlePostModalOpen, handleClose: handlePostModalClose } = useModal();
  const { formTitle, setFormTitle, formContent, setFormContent, formImage, setFormImage, resetForm } = usePostForm();
  const { isOpen: isLoginModalOpen, handleOpen: handleLoginModalOpen, handleClose: handleLoginModalClose } = useModal();
  const { isLoggedIn, currentUser, loginStatus, login, logout } = useAuth();

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
      const newMicropost = await ApiService.createMicropost(formData);
      addMicropost(newMicropost);
      handlePostModalClose();
      resetForm();
      await fetchMicroposts();
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

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-300 fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-pink-500">TypeGram</h1>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <button
                  onClick={handlePostModalOpen}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
                <button 
                  onClick={logout}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  Register
                </button>
                <button 
                  onClick={handleLoginModalOpen}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {loginStatus && (
          <div className={`text-center p-2 mb-4 ${loginStatus.includes('successful') || loginStatus.includes('Logged out') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {loginStatus}
          </div>
        )}
        <MicropostList microposts={microposts} />
      </main>

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
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
        onLogin={handleLogin}
      />
    </div>
  );
}