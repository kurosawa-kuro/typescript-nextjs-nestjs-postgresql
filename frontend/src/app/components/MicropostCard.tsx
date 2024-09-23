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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {imageUrl && (
        <div className="w-full h-48 relative">
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
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-purple-700">{post.title || 'Untitled'}</h2>
        <p className="text-gray-600 mb-4">{post.content || 'No content'}</p>
        <p className="text-gray-600 flex items-center mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
          User: {post.userName || 'Unknown'}
        </p>
      </div>
    </div>
  );
};