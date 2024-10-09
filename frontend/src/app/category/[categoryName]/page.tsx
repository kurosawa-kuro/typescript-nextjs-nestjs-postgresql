import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CategoryMicropostListWrapper } from '../../components/containers/wrappers/CategoryMicropostListWrapper';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

interface CategoryPageProps {
  params: { categoryName: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { categoryName } = params;

  if (!categoryName) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 capitalize">{categoryName}</h1>
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryMicropostListWrapper categoryName={categoryName} />
        </Suspense>
      </main>
    </div>
  );
}

export function generateMetadata({ params }: CategoryPageProps) {
  const { categoryName } = params;
  return {
    title: `${categoryName} - TypeGram`,
    description: `View all posts in the ${categoryName} category on TypeGram`,
  };
}