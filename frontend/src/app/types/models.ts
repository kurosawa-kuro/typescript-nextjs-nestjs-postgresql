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
  image: File | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  error: string | null;
}


// 非同期操作の共通状態を表す型
export interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
}

// AuthStateを更新
export interface AuthState extends AsyncOperationState {
  isLoggedIn: boolean;
  currentUser: User | null;
  loginStatus: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;
}

// MicropostStateを更新
export interface MicropostState extends AsyncOperationState {
  microposts: Micropost[];
  setMicroposts: (microposts: Micropost[]) => void;
  addMicropost: (newMicropost: Micropost) => void;
  fetchMicroposts: () => Promise<void>;
  createMicropost: (formData: FormData) => Promise<Micropost | null>;
}
