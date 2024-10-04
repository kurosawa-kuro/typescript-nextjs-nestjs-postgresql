import { Suspense } from 'react';
import { MicropostListWrapper } from "./components/containers/MicropostListWrapper";
import { LoadingSpinner } from './components/common/LoadingSpinner';

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <MicropostListWrapper />
        </Suspense>
      </main>
    </div>
  );
}