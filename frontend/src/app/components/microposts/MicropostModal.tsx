import React from 'react';
import Image from 'next/image';
import { MicropostModalProps } from '../../types/models';
import { ImageUtils } from '../../lib/utils/imageUtils';

export const MicropostModal = ({ isOpen, onClose, onSubmit, title, setTitle, image, onImageChange, isLoading, error }: MicropostModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <button onClick={onClose} className="text-gray-700 font-medium text-lg">Cancel</button>
          <h2 className="text-xl font-bold text-gray-900">Create new post</h2>
          <button onClick={onSubmit} className="text-blue-600 font-bold text-lg" disabled={isLoading}>
            {isLoading ? 'Sharing...' : 'Share'}
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="mb-4">
            <label htmlFor="image" className="block text-base font-semibold text-gray-800 mb-2">Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {image ? (
                  <div className="relative h-32 w-32 mx-auto">
                    <Image
                      src={ImageUtils.getPreviewUrl(image)}
                      alt="Preview"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-md"
                    />
                  </div>
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-base text-gray-700 mt-2">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-semibold text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onImageChange} accept="image/*" />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="title" className="block text-base font-semibold text-gray-800 mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base text-gray-800"
              required
            />
          </div>
        </form>
      </div>
    </div>
  );
};