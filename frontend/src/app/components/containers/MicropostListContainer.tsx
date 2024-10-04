// src/app/components/containers/MicropostListContainer.tsx
'use client';

import React, { useEffect } from 'react';
import { MicropostList } from "../microposts/MicropostList";
import { useMicropostStore } from '../../store/useMicropostStore';
import { Micropost } from '../../types/models';

interface MicropostListContainerProps {
  initialMicroposts: Micropost[];
}

export const MicropostListContainer: React.FC<MicropostListContainerProps> = ({ initialMicroposts }) => {
  const { microposts, setMicroposts } = useMicropostStore();

  useEffect(() => {
    console.log('Initial microposts:', initialMicroposts);
    if (Array.isArray(initialMicroposts) && initialMicroposts.length > 0) {
      setMicroposts(initialMicroposts);
    }
  }, [initialMicroposts, setMicroposts]);

  console.log('Current microposts in store:', microposts);

  return <MicropostList microposts={microposts} />;
};