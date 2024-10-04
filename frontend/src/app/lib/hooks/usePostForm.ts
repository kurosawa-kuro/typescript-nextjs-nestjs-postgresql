import { useState } from 'react';

export const usePostForm = () => {
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormImage(null);
  };

  return { formTitle, setFormTitle, formContent, setFormContent, formImage, setFormImage, resetForm };
};