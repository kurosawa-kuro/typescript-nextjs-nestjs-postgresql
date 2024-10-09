import { CategoryList } from "../../categories/CategoryList";
import { getCategories } from '../../../actions/categories';

export async function CategoryListWrapper() {
  const categories = await getCategories();
  return <CategoryList categories={categories} />;
}