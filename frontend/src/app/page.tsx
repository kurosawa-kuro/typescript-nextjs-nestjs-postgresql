'use client';
import React, { useState, useEffect } from "react";

interface Micropost {
  id: number;
  userId: number;
  title: string;
}

export default function Home() {
  const [microposts, setMicroposts] = useState<Micropost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMicroposts() {
      try {
        const response = await fetch('http://localhost:3001/microposts');
        if (!response.ok) {
          throw new Error('Failed to fetch microposts');
        }
        const data = await response.json();
        setMicroposts(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching microposts. Please try again later.');
        setLoading(false);
      }
    }

    fetchMicroposts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Oh no! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-r from-pink-50 to-purple-50 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-800">
        Microposts
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {microposts.map((post) => (
          <div key={post.id} className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-purple-700">{post.title}</h2>
              <p className="text-gray-600 flex items-center">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                User ID: {post.userId}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}