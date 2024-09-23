'use client';

import React, { useState, useEffect } from "react";
import { Micropost, MicropostModalProps, LoginResponse } from './types';
import { ApiService } from './api/apiService';
import LoginModal from './LoginModal';
import LoadingSpinner from "./components/common/LoadingSpinner";
import ErrorMessage from "./components/common/ErrorMessage";
import {ImageUtils} from "./utils/imageUtils";
import { useAuth } from "./hooks/useAuth";
import { useModal } from "./hooks/useModal";
import { useMicroposts } from "./hooks/useMicroposts";
import { usePostForm } from "./hooks/usePostForm";

// Constants
const API_URL = 'http://localhost:3001/microposts';


// UI Components
const MicropostCard = ({ post }: { post?: Micropost }) => {
  if (!post) {
    return null;
  }

  const imageUrl = post.imagePath 
    ? `http://localhost:3001/${ImageUtils.normalizePath(post.imagePath)}`
    : null;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {imageUrl && (
        <div className="w-full h-48 relative">
          <img 
            src={imageUrl} 
            alt={post.title || 'Micropost image'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'http://localhost:3001/uploads/test.png';
            }}
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-purple-700">{post.title || 'Untitled'}</h2>
        <p className="text-gray-600 mb-4">{post.content || 'No content'}</p>
        <p className="text-gray-600 flex items-center mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
          User: {post.userName || 'Unknown'}
        </p>
      </div>
    </div>
  );
};

const MicropostList = ({ microposts }: { microposts: Micropost[] }) => {
  if (!microposts || !Array.isArray(microposts) || microposts.length === 0) {
    return <div className="text-center text-gray-500 mt-4">No microposts available</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {microposts.map((post) => (
        <MicropostCard key={post?.id ?? `temp-${Math.random()}`} post={post} />
      ))}
    </div>
  );
};

const MicropostModal = ({ isOpen, onClose, onSubmit, title, setTitle, content, setContent, image, onImageChange }: MicropostModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Create a new Micropost</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              rows={4}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="mt-1 flex items-center">
              <span className="inline-block h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                {image ? (
                  <img src={ImageUtils.getPreviewUrl(image)} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-full w-full text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </span>
              <label
                htmlFor="image-upload"
                className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Choose File
              </label>
              <input
                id="image-upload"
                name="image-upload"
                type="file"
                className="sr-only"
                onChange={onImageChange}
                accept="image/*"
              />
            </div>
            {image && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file: {image.name}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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