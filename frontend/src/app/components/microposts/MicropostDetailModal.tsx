// src/app/components/microposts/MicropostDetailModal.tsx
import React from 'react';
import Image from 'next/image';
import { Micropost } from '../../types/models';
import { ImageUtils } from '../../lib/utils/imageUtils';

interface MicropostDetailModalProps {
  post: Micropost;
  onClose: () => void;
}

const API_BASE_URL = 'http://localhost:3001';

export const MicropostDetailModal: React.FC<MicropostDetailModalProps> = ({ post, onClose }) => {
  const imageUrl = post.imagePath ? `${API_BASE_URL}/${ImageUtils.normalizePath(post.imagePath)}` : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <h2 className="text-3xl font-bold mb-4 text-black">{post.title}</h2>
        {imageUrl && (
          <div className="relative w-full h-96 mb-4">
            <Image
              src={imageUrl}
              alt={post.title}
              layout="fill"
              objectFit="contain"
            />
          </div>
        )}
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};