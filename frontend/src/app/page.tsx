'use client';

import React, { useState, useEffect } from "react";
import LoginModal from './LoginModal';
// 1. 型定義
interface Micropost {
  id: number;
  userId: number;
  title: string;
  content: string;
  userName: string;
  imagePath?: string;
}

interface MicropostModalProps {
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

interface LoginResponse {
  success: boolean;
  message: string;
  token: string; // Add the token property
  user: {
    id: number;
    name: string;
    email: string;
  }; // Add the user property
}

// 2. 定数
const API_URL = 'http://localhost:3001/microposts';

// 3. API関連の関数
const fetchMicroposts = async (): Promise<Micropost[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Failed to fetch microposts');
  }
  return response.json();
};

const create = async (formData: FormData): Promise<Micropost> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Failed to create micropost');
  }
  const data = await response.json();
  return data.micropost;
};

// 4. カスタムフック
const useMicroposts = () => {
  const [microposts, setMicroposts] = useState<Micropost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMicropostsData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchMicroposts();
      setMicroposts(data);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage('Error fetching microposts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMicropostsData();
  }, []);

  const addMicropost = (newMicropost: Micropost) => {
    setMicroposts(prevMicroposts => [newMicropost, ...prevMicroposts]);
  };

  return { microposts, isLoading, errorMessage, addMicropost, fetchMicropostsData };
};

const useModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  return { isModalOpen, handleOpenModal, handleCloseModal };
};

const usePostForm = () => {
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState<File | null>(null);

  const resetForm = () => {
    setPostTitle("");
    setPostContent("");
    setPostImage(null);
  };

  return { postTitle, setPostTitle, postContent, setPostContent, postImage, setPostImage, resetForm };
};

// 5. ユーティリティ関数
const getImagePreviewUrl = (file: File | null) => {
  if (file && typeof URL !== 'undefined' && URL.createObjectURL) {
    return URL.createObjectURL(file);
  }
  return '/dummy-image-url.jpg'; // テスト環境用のダミーURL
};

// 6. UI コンポーネント
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-screen">
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Oh no! </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  </div>
);

const normalizeImagePath = (path: string) => {
  return path.replace(/\\/g, '/');
};

const MicropostCard = ({ post }: { post?: Micropost }) => {
  if (!post) {
    return null; // または適切なフォールバックUIを返す
  }

  const imageUrl = post.imagePath 
    ? `http://localhost:3001/${normalizeImagePath(post.imagePath)}`
    : null;

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {imageUrl && (
        <div className="w-full h-48 relative">
          <img 
            src={imageUrl} 
            alt={post.title || 'Micropost image'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null; // 再帰的なエラーを防ぐ
              e.currentTarget.src = 'http://localhost:3001/uploads/test.png'; // プレースホルダー画像のパスに置き換えてください
            }}
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2 text-purple-700">{post.title || 'Untitled'}</h2>
        <p className="text-gray-600 mb-4">{post.content || 'No content'}</p>
        <p className="text-gray-600 flex items-center mb-2">
          <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
          User: {post.userName || 'Unknown'}
        </p>
      </div>
    </div>
  );
};

const MicropostList = ({ microposts }: { microposts: Micropost[] }) => {
  console.log('Microposts:', microposts); // デバッグ用ログ

  if (!microposts || !Array.isArray(microposts) || microposts.length === 0) {
    console.log('No microposts available or invalid data');
    return <div className="text-center text-gray-500 mt-4">No microposts available</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {microposts.map((post) => (
        <MicropostCard key={post?.id ?? `temp-${Math.random()}`} post={post} />
      ))}
    </div>
  );
};

const MicropostModal = ({ isOpen, onClose, onSubmit, title, setTitle, content, setContent, image, onImageChange }: MicropostModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Create a new Micropost</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              rows={4}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">Image</label>
            <div className="mt-1 flex items-center">
              <span className="inline-block h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                {image ? (
                  <img src={getImagePreviewUrl(image)} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <svg className="h-full w-full text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </span>
              <label
                htmlFor="image-upload"
                className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Choose File
              </label>
              <input
                id="image-upload"
                name="image-upload"
                type="file"
                className="sr-only"
                onChange={onImageChange}
                accept="image/*"
              />
            </div>
            {image && (
              <p className="mt-2 text-sm text-gray-500">
                Selected file: {image.name}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-purple-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7. メインコンポーネント
export default function Home() {
  const { microposts, isLoading, errorMessage, addMicropost, fetchMicropostsData } = useMicroposts();
  const { isModalOpen, handleOpenModal, handleCloseModal } = useModal();
  const { postTitle, setPostTitle, postContent, setPostContent, postImage, setPostImage, resetForm } = usePostForm();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 新しい状態
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<LoginResponse['user'] | null>(null);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    if (!user) {
      console.error('User not found');
      return;
    }
    formData.append('userId', user.id.toString());
    formData.append('title', postTitle);
    formData.append('content', postContent);
    if (postImage) {
      formData.append('image', postImage);
    }

    try {
      const newMicropost = await create(formData);
      addMicropost(newMicropost);
      handleCloseModal();
      resetForm();
      // ページリロードを使わずにデータを再取得する
      await fetchMicropostsData();

    } catch (err) {
      console.error('Error creating micropost:', err);
      // エラー処理をここに追加することができます
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPostImage(e.target.files[0]);
    }
  };


  useEffect(() => {
    // アプリケーション起動時にローカルストレージをチェック
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // 更新されたハンドラー
  const handleLogin = async () => {
    console.log('Login button clicked');
    
    const loginData = {
      email: "jane.doe@example.com",
      password: "securepassword123"
    };

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        setLoginStatus('Login successful');
        console.log('Login successful');
        
        // localStorageにトークンとユーザー情報を保存
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // ステート更新
        setIsLoggedIn(true);
        setCurrentUser(data.user);
      } else {
        setLoginStatus('Login failed');
        console.error('Login failed');
      }
    } catch (error) {
      setLoginStatus('Error occurred during login');
      console.error('Error occurred during login:', error);
    }
  };

  const handleLogout = () => {
    // ログアウト処理
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginStatus('Logged out successfully');
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginModalClose = () => {
    setIsLoginModalOpen(false);
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    console.log('Login submitted', email, password);
    
    const loginData = { email, password };

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data: LoginResponse = await response.json();

      if (data.success) {
        setLoginStatus('Login successful');
        console.log('Login successful');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setIsLoggedIn(true);
        setCurrentUser(data.user);
        setIsLoginModalOpen(false);  // モーダルを閉じる
      } else {
        setLoginStatus('Login failed');
        console.error('Login failed');
      }
    } catch (error) {
      setLoginStatus('Error occurred during login');
      console.error('Error occurred during login:', error);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (errorMessage) return <ErrorMessage message={errorMessage} />;

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-r from-pink-50 to-purple-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-800">
        Microposts
      </h1>
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1"></div>
        <div className="flex-1 text-center">
          {isLoggedIn && (
            <button
              onClick={handleOpenModal}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              New Micropost
            </button>
          )}
        </div>
        <div className="flex-1 flex justify-end space-x-2">
          {!isLoggedIn && (
            <>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                Register
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleLoginClick}
              >
                Login
              </button>
            </>
          )}
          {isLoggedIn && (
            <div className="flex items-center bg-white rounded-lg shadow-md overflow-hidden">
              <span className="text-gray-800 font-medium px-4 py-2 bg-gray-100">
                {currentUser?.name}
              </span>
              <button 
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 transition duration-300 ease-in-out"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      {loginStatus && (
        <div className={`text-center p-2 mb-4 ${loginStatus.includes('successful') || loginStatus.includes('Logged out') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {loginStatus}
        </div>
      )}
      <MicropostList microposts={microposts} />
      <MicropostModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPost}
        title={postTitle}
        setTitle={setPostTitle}
        content={postContent}
        setContent={setPostContent}
        image={postImage}
        onImageChange={handleImageChange}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleLoginModalClose}
        onLogin={handleLoginSubmit}
      />
    </div>
  );
}

