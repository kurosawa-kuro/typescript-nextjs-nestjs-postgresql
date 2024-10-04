// frontend/src/app/types.ts

export interface Micropost {
  id: number;
  userId: number;
  title: string;
  content: string;
  userName: string;
  imagePath?: string;
}

export interface MicropostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  image: File | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
}