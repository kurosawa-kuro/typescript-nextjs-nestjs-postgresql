import { useState } from 'react';

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  return { isOpen, handleOpen, handleClose };
};