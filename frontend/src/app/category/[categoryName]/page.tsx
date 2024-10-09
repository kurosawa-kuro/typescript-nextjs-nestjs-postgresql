import { notFound } from 'next/navigation';
import { CategoryMicropostListWrapper } from '../../components/containers/wrappers/CategoryMicropostListWrapper';
import { CommonLayout } from '../../components/layouts/CommonLayout';

interface CategoryPageProps {
  params: { categoryName: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { categoryName } = params;

  if (!categoryName) {
    notFound();
  }

  return (
    <CommonLayout title={categoryName}>
      <CategoryMicropostListWrapper categoryName={categoryName} />
    </CommonLayout>
  );
}