import React from 'react';
import { User } from '../../types/models';
import Link from 'next/link';
import Image from 'next/image';

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
  // バックエンドの画像URLを構築する関数
  const getAvatarUrl = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/uploads/${path}`;
  };

  return (
    <header className="bg-white border-b border-gray-300 fixed top-0 left-0 right-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold text-pink-500 hover:text-pink-600 transition duration-300">
          TypeGram
        </Link>
        <div className="flex items-center space-x-4">
          {isLoggedIn && currentUser ? (
            <>
              <button
                onClick={handlePostModalOpen}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full p-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <Link href="/profile" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {currentUser.avatar_path ? (
                      <Image
                        src={getAvatarUrl(currentUser.avatar_path)}
                        alt={`${currentUser.name}'s avatar`}
                        width={32}
                        height={32}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:underline">
                    {currentUser.name}
                  </span>
                </Link>
              </div>
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