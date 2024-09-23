import { useState, useEffect } from 'react';
import { Micropost } from '../types';
import { ApiService } from '../api/apiService';

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