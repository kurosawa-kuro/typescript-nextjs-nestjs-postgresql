// frontend/src/app/components/Header.tsx

import React from 'react';
import { User } from '../types';

interface HeaderProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  handlePostModalOpen: () => void;
  handleLoginModalOpen: () => void;
  logout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLoggedIn,
  currentUser,
  handlePostModalOpen,
  handleLoginModalOpen,
  logout,
}) => {
  return (
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
  );
};