import { Suspense, ReactNode } from 'react';
import { CategoryListWrapper } from "../containers/wrappers/CategoryListWrapper";
import { LoadingSpinner } from '../common/LoadingSpinner';

interface CommonLayoutProps {
  children: ReactNode;
  title?: string;
}

export function CommonLayout({ children, title }: CommonLayoutProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        {title && <h1 className="text-3xl font-bold mb-6 text-gray-900 capitalize">{title}</h1>}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-7/8">
            <Suspense fallback={<LoadingSpinner />}>
              {children}
            </Suspense>
          </div>
          <div className="md:w-1/8">
            <Suspense fallback={<LoadingSpinner />}>
              <CategoryListWrapper />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}