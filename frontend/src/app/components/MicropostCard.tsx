import React from 'react';
import { Micropost } from '../types';
import { ImageUtils } from '../utils/imageUtils';

export const MicropostCard = ({ post }: { post?: Micropost }) => {
  if (!post) {
    return null;
  }

  const imageUrl = post.imagePath 
    ? `http://localhost:3001/${ImageUtils.normalizePath(post.imagePath)}`
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden h-full flex flex-col">
      <div className="p-3 flex items-center">
        <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
        <span className="font-semibold text-sm">{post.userName || 'Unknown'}</span>
      </div>
      {imageUrl && (
        <div className="w-full aspect-square relative flex-grow">
          <img 
            src={imageUrl} 
            alt={post.title || 'Micropost image'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'http://localhost:3001/uploads/test.png';
            }}
          />
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center space-x-3 mb-2">
          <button className="text-xl">❤️</button>
          <button className="text-xl">💬</button>
          <button className="text-xl">🚀</button>
        </div>
        <h2 className="font-semibold text-sm mb-1">{post.title || 'Untitled'}</h2>
        <p className="text-xs text-gray-600 line-clamp-2">{post.content || 'No content'}</p>
      </div>
    </div>
  );
};