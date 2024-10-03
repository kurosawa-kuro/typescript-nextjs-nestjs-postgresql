import React from "react";
import { ApiService } from './api/apiService';
import { ClientHomeWrapper } from "./components/ClientHomeWrapper";

async function getMicroposts() {
  const microposts = await ApiService.fetchMicroposts();
  console.log('microposts', microposts);
  return microposts;
}

export default async function Home() {
  const initialMicroposts = await getMicroposts();

  return (
    <div className="bg-gray-50 min-h-screen">
      <ClientHomeWrapper initialMicroposts={initialMicroposts} />
    </div>
  );
}