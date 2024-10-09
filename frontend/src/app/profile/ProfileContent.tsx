'use client';

import { User } from '../types/models';
import { ErrorMessage } from '../components/common/ErrorMessage';

interface ProfileContentProps {
  initialProfile: User | null;
}

export function ProfileContent({ initialProfile }: ProfileContentProps) {
  const user = initialProfile;

  if (!user) {
    return <ErrorMessage message="User not found" />;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">User Profile</h2>
      <div className="space-y-4">
        <div>
          <span className="font-semibold text-gray-700">Name:</span>{' '}
          <span className="text-black">{user.name}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Email:</span>{' '}
          <span className="text-black">{user.email}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-700">User ID:</span>{' '}
          <span className="text-black">{user.id}</span>
        </div>
        {user.isAdmin && (
          <div>
            <span className="font-semibold text-gray-700">Admin Status:</span>{' '}
            <span className="text-black">Yes</span>
          </div>
        )}
      </div>
      <div className="mt-6">
        <button 
          onClick={() => console.log('Edit profile clicked')} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}