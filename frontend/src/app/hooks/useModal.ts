import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const router = useRouter();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleOpenWithNavigation = useCallback(() => {
    router.push('/');
    setIsOpen(true);
  }, [router]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, handleOpen, handleOpenWithNavigation, handleClose };
};