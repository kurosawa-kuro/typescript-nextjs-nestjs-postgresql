import React, { useEffect } from 'react';
import Link from 'next/link';
import { Micropost } from '../../types/models';
import { ImageUtils } from '../../lib/utils/imageUtils';

interface MicropostDetailModalProps {
  post: Micropost;
  onClose: () => void;
}

const API_BASE_URL = 'http://localhost:3001';

export const MicropostDetailModal: React.FC<MicropostDetailModalProps> = ({ post, onClose }) => {
  const imageUrl = post.imagePath
    ? `${API_BASE_URL}/${ImageUtils.normalizePath(post.imagePath)}`
    : null;
  const avatarUrl = post.user.avatarPath
    ? `${API_BASE_URL}/${ImageUtils.normalizePath(post.user.avatarPath)}`
    : null;

  useEffect(() => {
    console.log('post.imagePath:', post.imagePath);
    console.log('post.user.avatarPath:', post.user.avatarPath);
    console.log('Normalized imageUrl:', imageUrl);
    console.log('Normalized avatarUrl:', avatarUrl);
  }, [post, imageUrl, avatarUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center mb-4">
          {avatarUrl && (
            <div className="relative w-[50px] h-[50px]">
              <img
                src={avatarUrl}
                alt={`${post.user.name}'s avatar`}
                className="rounded-full object-cover w-full h-full"
              />
            </div>
          )}
          <span className="ml-4 text-xl font-bold text-black">{post.user.name}</span>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-black">{post.title}</h2>
        {imageUrl && (
          <div className="relative w-full h-96 mb-4 border border-gray-300 rounded">
            <img 
              src={imageUrl} 
              alt={post.title} 
              className="object-contain w-full h-full"
            />
          </div>
        )}
        {post.categories && post.categories.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-black">Categories:</h3>
            <ul className="list-disc list-inside">
              {post.categories.map((category) => (
                <li key={category.id} className="text-black">
                  <Link
                    href={`/category/${encodeURIComponent(category.title)}`}
                    className="text-blue-500 hover:underline"
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};