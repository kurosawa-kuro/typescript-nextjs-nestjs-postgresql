'use client';

import React, { useEffect } from 'react';
import { MicropostList } from "../microposts/MicropostList";
import { useMicropostStore } from '../../store/useMicropostStore';
import { Micropost } from '../../types/models';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';

interface MicropostListContainerProps {
  initialMicroposts: Micropost[];
}

export const MicropostListContainer: React.FC<MicropostListContainerProps> = ({ initialMicroposts }) => {
  const { microposts, isLoading, error, setMicroposts, fetchMicroposts } = useMicropostStore();

  useEffect(() => {
    if (initialMicroposts && initialMicroposts.length > 0) {
      setMicroposts(initialMicroposts);
    } else {
      fetchMicroposts();
    }
  }, [initialMicroposts, setMicroposts, fetchMicroposts]);

  if (isLoading && (!microposts || microposts.length === 0)) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // フィルタリングを追加して未定義の投稿を除外
  const validMicroposts = microposts ? microposts.filter(post => post !== undefined) : [];

  return <MicropostList microposts={validMicroposts} />;
};