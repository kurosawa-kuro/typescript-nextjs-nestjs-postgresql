import { MicropostList } from "../../microposts/MicropostList";
import { getMicroposts } from '../../../actions/microposts';

export async function MicropostListWrapper() {
  const microposts = await getMicroposts();
  return <MicropostList microposts={microposts} />;
}