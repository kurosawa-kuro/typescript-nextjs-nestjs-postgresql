// LoginModalContainer.tsx
import React from "react";
import { LoginModal } from './auth/LoginModal';

type LoginModalContainerProps = {
  isOpen: boolean;
  onClose: () => void;
  login: (email: string, password: string) => Promise<boolean>;
};

export function LoginModalContainer({ isOpen, onClose, login }: LoginModalContainerProps) {
  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      onClose();
    }
  };

  return (
    <LoginModal
      isOpen={isOpen}
      onClose={onClose}
      onLogin={handleLogin}
    />
  );
}