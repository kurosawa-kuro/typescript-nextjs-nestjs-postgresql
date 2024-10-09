// HeaderContainer.tsx
import React from "react";
import { Header } from '../layouts/Header';
import { User } from '../../types/models';

type HeaderContainerProps = {
  isLoggedIn: boolean;
  currentUser: User | null;
  logout: () => void;
  handlePostModalOpen: () => void;
  handleLoginModalOpen: () => void;
};

export function HeaderContainer({ 
  isLoggedIn, 
  currentUser, 
  logout, 
  handlePostModalOpen, 
  handleLoginModalOpen 
}: HeaderContainerProps) {
  return (
    <Header
      isLoggedIn={isLoggedIn}
      currentUser={currentUser}
      handlePostModalOpen={handlePostModalOpen}
      handleLoginModalOpen={handleLoginModalOpen}
      logout={logout}
    />
  );
}