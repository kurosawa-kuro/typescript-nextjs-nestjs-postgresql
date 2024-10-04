import { Suspense } from 'react';
import { MicropostList } from "./components/microposts/MicropostList";
import { getMicroposts } from './actions/getMicroposts';
import { LoadingSpinner } from './components/common/LoadingSpinner';

export default async function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <Suspense fallback={<LoadingSpinner />}>
          <MicropostListWrapper />
        </Suspense>
      </main>
    </div>
  );
}

async function MicropostListWrapper() {
  const microposts = await getMicroposts();
  return <MicropostList microposts={microposts} />;
}