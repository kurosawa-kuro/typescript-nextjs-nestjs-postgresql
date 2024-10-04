// src/app/components/microposts/MicropostList.tsx
import React from 'react';
import { Micropost } from '../../types/models';
import { MicropostCard } from './MicropostCard';

interface MicropostListProps {
  microposts: Micropost[];
}

export const MicropostList: React.FC<MicropostListProps> = ({ microposts }) => {
  if (!Array.isArray(microposts) || microposts.length === 0) {
    return <div className="text-center text-gray-500 mt-4">No posts available</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {microposts.map((post) => {
        if (!post || typeof post !== 'object' || !('id' in post)) {
          console.error('Invalid post object:', post);
          return null;
        }
        return <MicropostCard key={post.id} post={post} />;
      })}
    </div>
  );
};