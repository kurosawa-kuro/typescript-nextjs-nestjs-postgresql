"use client"

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Micropost } from '../types';
import { ImageUtils } from '../utils/imageUtils';

interface MicropostCardProps {
  post: Micropost;
}

const API_BASE_URL = 'http://localhost:3001';

export const MicropostCard: React.FC<MicropostCardProps> = ({ post }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(() => {
    if (post.imagePath) {
      const normalizedPath = ImageUtils.normalizePath(post.imagePath);
      return `${API_BASE_URL}/${normalizedPath}`;
    }
    return null;
  }, [post.imagePath]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {imageUrl && !imageError ? (
        <div className="relative w-full h-48">
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
            onError={handleImageError}
          />
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No image available</span>
        </div>
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
        <p className="text-gray-600">{post.content}</p>
      </div>
    </div>
  );
};