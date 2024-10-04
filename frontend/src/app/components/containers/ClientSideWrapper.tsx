'use client';

import React from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useModal } from "../../hooks/useModal";
import { HeaderContainer } from './HeaderContainer';
import { LoginModalContainer } from './LoginModalContainer';
import { MicropostModalContainer } from './MicropostModalContainer';

export function ClientSideWrapper({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, currentUser, logout  } = useAuthStore();
  const { isOpen: isLoginModalOpen, handleOpen: handleLoginModalOpen, handleClose: handleLoginModalClose } = useModal();
  const { isOpen: isPostModalOpen, handleOpen: handlePostModalOpen, handleClose: handlePostModalClose } = useModal();

  return (
    <>
      <HeaderContainer
        isLoggedIn={isLoggedIn}
        currentUser={currentUser}
        logout={logout}
        handlePostModalOpen={handlePostModalOpen}
        handleLoginModalOpen={handleLoginModalOpen}
      />

      {children}

      <LoginModalContainer 
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
      />
      <MicropostModalContainer 
        isOpen={isPostModalOpen}
        onClose={handlePostModalClose}
      />
    </>
  );
}