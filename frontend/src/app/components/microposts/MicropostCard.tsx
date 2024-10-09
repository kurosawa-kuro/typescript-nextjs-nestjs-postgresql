// src/app/components/microposts/MicropostCard.tsx
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Micropost } from '../../types/models';
import { ImageUtils } from '../../lib/utils/imageUtils';

interface MicropostCardProps {
  post: Micropost;
  onClick: (post: Micropost) => void;
}

const API_BASE_URL = 'http://localhost:3001';

export const MicropostCard: React.FC<MicropostCardProps> = ({ post, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(() => {
    if (post?.imagePath) {
      const normalizedPath = ImageUtils.normalizePath(post.imagePath);
      return `${API_BASE_URL}/${normalizedPath}`;
    }
    return null;
  }, [post?.imagePath]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    onClick(post);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer" onClick={handleClick}>
      {imageUrl && !imageError ? (
        <div className="relative w-full h-48">
          <Image
            src={imageUrl}
            alt={post.title}
            layout="fill"
            objectFit="cover"
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