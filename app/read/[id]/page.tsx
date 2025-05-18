"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Reader } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { openDB } from "idb";

interface BookItem {
  id: string;
  title: string;
  author: string;
  cover: string;
  dataUrl: string;
  addedAt: string;
}

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookId = params.id as string;
    const fetchBooks = async () => {
      const db = await openDB(process.env.NEXT_PUBLIC_APP_DB!);
      const booksFromStorage = await db.getAllKeys(
        process.env.NEXT_PUBLIC_BOOKS_TABLE!
      );
      return booksFromStorage;
    };
    fetchBooks().then((booksFromStorage) => {
      if (booksFromStorage) {
        const foundBook = booksFromStorage.find((b) => b.toString() === bookId);

        if (foundBook) {
          setBook(foundBook.toString());
        } else {
          router.push("/");
        }
      } else {
        router.push("/");
      }

      setLoading(false);
    });
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="bg-background border-b p-4 flex items-center">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mr-4"
        >
          <ChevronLeft size={16} className="mr-2" />
          Back to Library
        </Button>
        {/* <div>
          <h1 className="font-semibold">{book.title}</h1>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div> */}
      </div>
      <div className="flex-1 h-full w-full">
        <Reader bookId={book} />
      </div>
    </div>
  );
}
