import { MicropostList } from "../microposts/MicropostList";
import { getCategoryMicroposts } from '../../actions/getCategoryMicroposts';
import { ErrorMessage } from '../common/ErrorMessage';

export async function CategoryMicropostListWrapper({ categoryId }: { categoryId: string }) {
  const microposts = await getCategoryMicroposts(categoryId);
  
  if (microposts.length === 0) {
    return <ErrorMessage message="No posts found for this category" />;
  }
  
  return <MicropostList microposts={microposts} />;
}