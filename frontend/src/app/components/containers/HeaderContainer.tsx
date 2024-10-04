// HeaderContainer.tsx
import React from "react";
import { Header } from '../layout/Header';

type HeaderContainerProps = {
  isLoggedIn: boolean;
  currentUser: any; // Replace 'any' with a proper user type
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