// src/app/page.tsx
import { MicropostListContainer } from "./components/containers/MicropostListContainer";
import { ApiService } from './lib/api/apiService';

async function getMicroposts() {
  const microposts = await ApiService.fetchMicroposts();
  return microposts;
}

export default async function Home() {
  const initialMicroposts = await getMicroposts();

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <MicropostListContainer initialMicroposts={initialMicroposts} />
      </main>
    </div>
  );
}