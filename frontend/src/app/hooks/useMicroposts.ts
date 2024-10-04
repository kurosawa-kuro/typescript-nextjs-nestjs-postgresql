// frontend\src\app\hooks\useMicroposts.ts

import { useState, useEffect } from 'react';
import { Micropost } from '../types/models';
import { ApiService } from '../lib/api/apiService';

export const useMicroposts = () => {
  const [microposts, setMicroposts] = useState<Micropost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMicroposts = async () => {
    try {
      setIsLoading(true);
      const data = await ApiService.fetchMicroposts();
      setMicroposts(data);
      setError(null);
    } catch (err) {
      setError('Error fetching microposts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMicroposts();
  }, []);

  const addMicropost = (newMicropost: Micropost) => {
    setMicroposts(prevMicroposts => [newMicropost, ...prevMicroposts]);
  };

  return { microposts, isLoading, error, addMicropost, fetchMicroposts };
};