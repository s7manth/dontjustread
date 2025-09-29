"use client";
import { BookGrid } from "@/components/book-grid";
import { Header } from "@/components/header";
import { useState } from "react";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 gap-4 flex flex-col">
        <Header onUploadComplete={() => setRefreshKey((k) => k + 1)} />
        <div key={refreshKey}>
          <BookGrid />
        </div>
      </div>
    </main>
  );
}
