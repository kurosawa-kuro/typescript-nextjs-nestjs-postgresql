import React from 'react';
import { Micropost } from '../types';
import { MicropostCard } from './MicropostCard';

export const MicropostList = ({ microposts }: { microposts: Micropost[] }) => {
  if (!microposts || !Array.isArray(microposts) || microposts.length === 0) {
    return <div className="text-center text-gray-500 mt-4">No posts available</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {microposts.map((post) => (
        <MicropostCard key={post?.id ?? `temp-${Math.random()}`} post={post} />
      ))}
    </div>
  );
};