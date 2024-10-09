import { Suspense } from 'react';
import { CategoryMicropostListWrapper } from '../../components/containers/CategoryMicropostListWrapper';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getCategoryId } from '../../actions/getCategoryId';
import { ErrorMessage } from '../../components/common/ErrorMessage';

export default async function CategoryPage({ params }: { params: { categoryName: string } }) {
  const categoryId = await getCategoryId(params.categoryName);

  if (categoryId === null) {
    return <ErrorMessage message="Category not found" />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 capitalize">{params.categoryName} Posts</h1>
        <Suspense fallback={<LoadingSpinner />}>
          <CategoryMicropostListWrapper categoryId={categoryId.toString()} />
        </Suspense>
      </main>
    </div>
  );
}