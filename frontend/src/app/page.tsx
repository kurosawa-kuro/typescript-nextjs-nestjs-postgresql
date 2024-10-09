import { Suspense } from 'react';
import { MicropostListWrapper } from "./components/containers/wrappers/MicropostListWrapper";
import { CategoryListWrapper } from "./components/containers/wrappers/CategoryListWrapper";
import { LoadingSpinner } from './components/common/LoadingSpinner';

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-3/4">
            <Suspense fallback={<LoadingSpinner />}>
              <MicropostListWrapper />
            </Suspense>
          </div>
          <div className="md:w-1/4">
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryListWrapper />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}