// src/app/types/models.ts

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface Micropost {
  id: number;
  userId: number;
  title: string;
  userName: string;
  imagePath?: string;
}

export interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
}

export interface MicropostModalProps extends AsyncOperationState {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  title: string;
  setTitle: (title: string) => void;
  image: File | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface AuthState extends AsyncOperationState {
  isLoggedIn: boolean;
  currentUser: User | null;
  loginStatus: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;
}

export interface MicropostState extends AsyncOperationState {
  microposts: Micropost[];
  setMicroposts: (microposts: Micropost[]) => void;
  addMicropost: (newMicropost: Micropost) => void;
  fetchMicroposts: () => Promise<void>;
  createMicropost: (formData: FormData) => Promise<Micropost | null>;
  initializeMicroposts: () => void;
}