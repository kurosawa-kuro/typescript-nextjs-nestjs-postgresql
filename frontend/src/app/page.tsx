// frontend\src\app\page.tsx

'use client';

import React  from "react";
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

// Main Component
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
    <div className="container mx-auto px-4 py-8 bg-gradient-to-r from-pink-50 to-purple-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-800">
        Microposts
      </h1>
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
          {isLoggedIn && (
            <button
              onClick={handlePostModalOpen}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              New Micropost
            </button>
          )}
        </div>
        <div className="flex-1 flex justify-end space-x-2">
          {!isLoggedIn && (
            <>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Register
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleLoginModalOpen}
              >
                Login
              </button>
            </>
          )}
          {isLoggedIn && (
            <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden">
              <span className="text-gray-800 font-medium px-4 py-2 bg-gray-100">
                {currentUser?.name}
              </span>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 transition duration-300 ease-in-out"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {loginStatus && (
        <div className={`text-center p-2 mb-4 ${loginStatus.includes('successful') || loginStatus.includes('Logged out') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {loginStatus}
        </div>
      )}
      <MicropostList microposts={microposts} />
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