// src/app/lib/utils/imageUtils.ts
export const ImageUtils = {
  getPreviewUrl: (file: File | null) => {
    if (file && typeof URL !== 'undefined' && URL.createObjectURL) {
      return URL.createObjectURL(file);
    }
    return '/dummy-image-url.jpg';
  },

  normalizePath: (path: string) => {
    // パスが既に 'uploads/' で始まっている場合は追加しない
    const normalizedPath = path.startsWith('uploads/') ? path : `uploads/${path}`;
    return normalizedPath.replace(/\\/g, '/');
  }
};