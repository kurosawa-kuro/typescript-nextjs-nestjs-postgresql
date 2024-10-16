import React, { useState, useMemo } from 'react';
import { MicroPost } from '../../types/models';

interface MicropostCardProps {
  post?: MicroPost;
  onClick?: (post: MicroPost) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const MicropostCard: React.FC<MicropostCardProps> = ({ post, onClick }) => {
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const getImageUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const normalizedPath = path.replace(/^uploads\//, '').replace(/\\/g, '/');
    return `${API_BASE_URL}/uploads/${normalizedPath}`;
  };

  const imageUrl = useMemo(() => getImageUrl(post?.imagePath), [post?.imagePath]);
  const avatarUrl = useMemo(() => getImageUrl(post?.user?.avatarPath), [post?.user?.avatarPath]);

  const handleImageError = () => {
    console.error('Image failed to load:', imageUrl);
    setImageError(true);
  };

  const handleAvatarError = () => {
    console.error('Avatar failed to load:', avatarUrl);
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
      <div className="relative w-full h-48">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-700 font-medium text-lg">
              {imageUrl ? 'Image failed to load' : 'No image available'}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt={`${post.user?.name || 'User'}'s avatar`}
                className="w-full h-full object-cover"
                onError={handleAvatarError}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                {avatarUrl ? 'Avatar failed' : 'No Avatar'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};