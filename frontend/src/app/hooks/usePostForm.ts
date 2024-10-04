import { useState } from 'react';

export const usePostForm = () => {
  const [formTitle, setFormTitle] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);

  const resetForm = () => {
    setFormTitle("");
    setFormImage(null);
  };

  return { formTitle, setFormTitle, formImage, setFormImage, resetForm };
};