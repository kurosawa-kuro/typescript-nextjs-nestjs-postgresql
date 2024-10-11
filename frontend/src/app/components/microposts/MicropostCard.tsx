import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Micropost } from '../../types/models';
import { ImageUtils } from '../../lib/utils/imageUtils';

interface MicropostCardProps {
  post?: Micropost;
  onClick?: (post: Micropost) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const MicropostCard: React.FC<MicropostCardProps> = ({ post, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${API_BASE_URL}/uploads/${ImageUtils.normalizePath(path)}`;
  };

  const imageUrl = useMemo(() => getImageUrl(post?.imagePath ?? null), [post?.imagePath]);
  const avatarUrl = useMemo(() => getImageUrl(post?.userAvatarPath ?? null), [post?.userAvatarPath]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const handleClick = () => {
    if (post && onClick) {
      onClick(post);
    }
  };

  if (!post) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
        <span className="text-gray-700 font-medium text-lg">Post not available</span>
      </div>
    );
  }

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
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
            {avatarUrl && !avatarError ? (
              <Image
                src={avatarUrl}
                alt={`${post.userName}'s avatar`}
                width={40}
                height={40}
                className="object-cover"
                onError={handleAvatarError}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                No Avatar
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
            <p className="text-sm text-gray-600">{post.userName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};