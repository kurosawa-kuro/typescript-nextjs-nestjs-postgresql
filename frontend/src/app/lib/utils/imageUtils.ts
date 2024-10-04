export const ImageUtils = {
    getPreviewUrl: (file: File | null) => {
      if (file && typeof URL !== 'undefined' && URL.createObjectURL) {
        return URL.createObjectURL(file);
      }
      return '/dummy-image-url.jpg';
    },
  
    normalizePath: (path: string) => {
      return path.replace(/\\/g, '/');
    }
  };