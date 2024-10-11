// src/app/types/models.ts

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean; 
  avatar_path: string;
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
  imagePath: string | null;
  userName: string;
  userAvatarPath: string | null;
  // categories: Category[]; // カテゴリー情報を追加
}

export interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
}

export interface MicropostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  image: File | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  error: string | null;
  selectedCategoryIds: number[];
  setSelectedCategoryIds: React.Dispatch<React.SetStateAction<number[]>>;
  availableCategories: Category[];
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
}

// 追加された ApiError インターフェース
export interface ApiError extends Error {
  statusCode?: number;
}

export interface Category {
  id: number;
  title: string;
}