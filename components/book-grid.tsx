"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Book } from "lucide-react";
import { openDB } from "idb";

interface BookItem {
  id: string;
  title: string;
  author: string;
  cover: string;
  dataUrl: string;
  addedAt: string;
}

const appDb = process.env.NEXT_PUBLIC_APP_DB!;
const booksTable = process.env.NEXT_PUBLIC_BOOKS_TABLE!;

export function BookGrid() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [bookKeys, setBookKeys] = useState<IDBValidKey[]>([]);

  async function checkDatabaseExists(dbName: string) {
    try {
      const db = await openDB(dbName);
      db.close();
      return true;
    } catch (error) {
      return false;
    }
  }

  const loadBooks = async () => {
    if (!(await checkDatabaseExists(appDb))) {
      return;
    }

    const db = await openDB(appDb);

    if (!db.objectStoreNames.contains(booksTable)) {
      return;
    }

    const bookKeys = await db.getAllKeys(booksTable);
    if (!bookKeys || bookKeys.length === 0) {
      setBooks([]);
      return;
    }

    const books = await db.getAll(booksTable);

    setBooks(books);
    setBookKeys(bookKeys);

    db.close();
  };

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <div className="space-y-6">
      {books.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="flex justify-center mb-4">
            <Book size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No books yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first ePub book to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bookKeys
            .map((bookKey, i) => {
              return { key: bookKey, book: books[i] };
            })
            .map(({ key, book }) => (
              <Link href={`/read/${key}`} key={key.toString()}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[2/3] bg-muted rounded-md flex items-center justify-center">
                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Book size={48} className="text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      {book.author}
                    </p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
