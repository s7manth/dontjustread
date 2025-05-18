import { BookGrid } from "@/components/book-grid";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 gap-4 flex flex-col">
        <Header />
        <BookGrid />
      </div>
    </main>
  );
}
