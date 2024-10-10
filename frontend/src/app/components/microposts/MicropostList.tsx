// src/app/components/microposts/MicropostList.tsx
'use client';

import React, { useState } from 'react';
import { Micropost } from '../../types/models';
import { MicropostCard } from './MicropostCard';
import { MicropostDetailModal } from './MicropostDetailModal';

interface MicropostListProps {
  microposts: Micropost[];
}

export const MicropostList: React.FC<MicropostListProps> = ({ microposts }) => {
  const [selectedPost, setSelectedPost] = useState<Micropost | null>(null);

  const handlePostClick = (post: Micropost) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  if (!Array.isArray(microposts) || microposts.length === 0) {
    return <div className="text-center text-gray-500 mt-4">No posts available</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {microposts.map((post) => {
          if (!post || typeof post !== 'object' || !('id' in post)) {
            return null;
          }
          return <MicropostCard key={post.id} post={post} onClick={() => handlePostClick(post)} />;
        })}
      </div>
      {selectedPost && (
        <MicropostDetailModal post={selectedPost} onClose={handleCloseModal} />
      )}
    </>
  );
};