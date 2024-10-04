import React from "react";
import { LoginModal } from '../auth/LoginModal';
import { useAuthStore } from '../../store/useAuthStore.';

type LoginModalContainerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function LoginModalContainer({ isOpen, onClose }: LoginModalContainerProps) {
  const login = useAuthStore(state => state.login);

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