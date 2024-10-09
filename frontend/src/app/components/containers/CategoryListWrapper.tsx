import { CategoryList } from "../Categories/CategoryList";
import { getCategories } from '../../actions/getCategories';

export async function CategoryListWrapper() {
  const categories = await getCategories();
  return <CategoryList categories={categories} />;
}