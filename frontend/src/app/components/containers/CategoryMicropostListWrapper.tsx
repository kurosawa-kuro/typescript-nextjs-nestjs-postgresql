import { MicropostList } from "../microposts/MicropostList";
import { getCategoryMicroposts } from '../../actions/getCategoryMicroposts';
import { ErrorMessage } from '../common/ErrorMessage';

export async function CategoryMicropostListWrapper({ categoryName }: { categoryName: string }) {
  const microposts = await getCategoryMicroposts(categoryName);
  
  if (microposts.length === 0) {
    return <ErrorMessage message={`No posts found for the category "${categoryName}"`} />;
  }
  
  return <MicropostList microposts={microposts} />;
}