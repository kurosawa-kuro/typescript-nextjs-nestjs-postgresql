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
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-3 flex items-center border-b border-gray-200 bg-gray-50">
        <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
        <span className="font-semibold text-sm text-gray-800">{post.userName || 'Unknown'}</span>
      </div>
      {imageUrl && (
        <div className="aspect-square relative">
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
      <div className="p-3 bg-white">
        <div className="flex items-center space-x-3 mb-2">
          <button className="text-2xl">❤️</button>
          <button className="text-2xl">💬</button>
          <button className="text-2xl">🚀</button>
        </div>
        <h2 className="font-semibold text-base mb-1 text-gray-900">{post.title || 'Untitled'}</h2>
      </div>
    </div>
  );
};