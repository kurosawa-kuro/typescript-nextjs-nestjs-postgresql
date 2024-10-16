import { MicropostListWrapper } from "./components/containers/wrappers/MicropostListWrapper";
import { CommonLayout } from "./components/layouts/CommonLayout";

export default function Home() {
  return (
    <CommonLayout>
      <MicropostListWrapper />
    </CommonLayout>
  );
}