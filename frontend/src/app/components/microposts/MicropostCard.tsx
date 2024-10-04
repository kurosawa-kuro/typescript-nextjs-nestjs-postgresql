// src/app/components/microposts/MicropostCard.tsx

"use client"

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Micropost } from '../../types/models';
import { ImageUtils } from '../../lib/utils/imageUtils';

interface MicropostCardProps {
  post?: Micropost;
}

const API_BASE_URL = 'http://localhost:3001';

export const MicropostCard: React.FC<MicropostCardProps> = ({ post }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log('MicropostCard received post:', post);
  }, [post]);

  const imageUrl = useMemo(() => {
    if (post?.imagePath) {
      const normalizedPath = ImageUtils.normalizePath(post.imagePath);
      return `${API_BASE_URL}/${normalizedPath}`;
    }
    return null;
  }, [post?.imagePath]);

  const handleImageError = () => {
    setImageError(true);
    console.log('Image loading error occurred');
  };

  if (!post) {
    console.log('Post is undefined or null');
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-700 font-medium text-lg">Post not available</span>
        </div>
      </div>
    );
  }

  console.log('Rendering post:', post.title);
  console.log('Image URL:', imageUrl);

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
          <span className="text-gray-700 font-medium text-lg">No image available</span>
        </div>
      )}
      <div className="p-4">
        <h2 className="text-2xl mb-2 text-gray-900">{post.title}</h2>
      </div>
    </div>
  );
};