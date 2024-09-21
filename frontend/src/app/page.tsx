'use client';

import React, { useState, useEffect } from "react";

interface Micropost {
  id: number;
  userId: number;
  title: string;
  userName: string;
}

export default function Home() {
  const [microposts, setMicroposts] = useState<Micropost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, content });
    setIsModalOpen(false);
    setTitle("");
    setContent("");
  };

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
      <div className="mb-6 text-center">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
        >
          New Micropost
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {microposts.map((post) => (
          <div key={post.id} className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2 text-purple-700">{post.title}</h2>
              <p className="text-gray-600 flex items-center mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                User: {post.userName}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Create a new Micropost</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 border-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 px-3 py-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 border-2 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 px-3 py-2"
                  rows={4}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}