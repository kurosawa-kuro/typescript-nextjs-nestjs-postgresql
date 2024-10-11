// src/app/demo-login/page.tsx

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/useAuthStore';

export default function DemoLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => {
    const demoLogin = async () => {
      const email = 'alice@example.com'; // デモユーザーのメールアドレス
      const password = 'hashed_password'; // デモユーザーのパスワード

      const success = await login(email, password);

      if (success) {
        // ログインに成功したら、トップページなどにリダイレクト
        router.push('/');
      } else {
        // ログインに失敗した場合の処理
        console.error('デモログインに失敗しました');
      }
    };

    demoLogin();
  }, [login, router]);

  return <p>デモユーザーでログインしています...</p>;
}
