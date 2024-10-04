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
  const { microposts, isLoading, error, setMicroposts } = useMicropostStore();

  useEffect(() => {
    setMicroposts(initialMicroposts);
  }, [initialMicroposts, setMicroposts]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return <MicropostList microposts={microposts} />;
};