import { Suspense } from 'react';
import { ProfileContent } from './ProfileContent';
import { getUserProfile } from '../actions/users';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export default async function ProfilePage() {
  const userProfile = await getUserProfile();
console.log("userProfile", userProfile);
  if (!userProfile) {
    return <ErrorMessage message="Please log in to view your profile." />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <ProfileContent initialProfile={userProfile} />
        </Suspense>
      </main>
    </div>
  );
}