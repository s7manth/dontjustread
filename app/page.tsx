"use client";

import { BookGrid } from "@/components/book-grid";
import { Header } from "@/components/header";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="bg-background min-h-screen">
      <div className="container mx-auto flex flex-col gap-4 px-4 py-8">
        <Header
          onUploadComplete={() => setRefreshKey((k) => k + 1)}
          onDuplicate={() => toast.info("Duplicate book")}
        />
        <div key={refreshKey}>
          <BookGrid />
        </div>
      </div>
    </main>
  );
}
