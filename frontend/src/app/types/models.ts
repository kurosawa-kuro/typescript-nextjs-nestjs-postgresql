// src/app/types/models.ts
export interface Micropost {
  id: number;
  userId: number;
  title: string;
  content: string;
  userName: string;
  imagePath?: string;
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


// Ensure that MicropostModalProps is defined and exported here

export interface MicropostModalProps {

  isOpen: boolean;

  onClose: () => void;

  onSubmit: (event: React.FormEvent) => void;

  title: string;

  setTitle: (title: string) => void;

  content: string;

  setContent: (content: string) => void;

  image: File | null;

  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

}
