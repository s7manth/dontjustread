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
import { Book, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDB } from "@/context/db-context";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface BookListItem {
  title: string;
  author: string;
  coverUrl?: string;
  progressPercent?: number;
  finished?: boolean;
}

export function BookGrid() {
  const [books, setBooks] = useState<BookListItem[]>([]);
  const [bookKeys, setBookKeys] = useState<IDBValidKey[]>([]);
  const { getAllBooks, getAllBookKeys, getAllBookMetadata, deleteBook, isLoading } = useDB();

  const loadBooks = async () => {
    const bookKeys = await getAllBookKeys();
    if (!bookKeys || bookKeys.length === 0) {
      setBooks([]);
      return;
    }
    const books = await getAllBooks();
    const metadata = await getAllBookMetadata();
    console.log("Books:", books);
    console.log("Metadata:", metadata);

    const listItems: BookListItem[] = bookKeys.map((_, idx) => {
      const m = metadata[idx] || {};
      let coverUrl: string | undefined;
      try {
        if (m?.coverBlob) {
          coverUrl = URL.createObjectURL(m.coverBlob as Blob);
        }
      } catch {}
      return {
        title: (m?.title || "Untitled").toString(),
        author: (m?.creator || "").toString(),
        coverUrl,
        progressPercent: typeof m?.readingProgressPercent === "number" ? m.readingProgressPercent : undefined,
        finished: Boolean(m?.finished),
      };
    });

    setBooks(listItems);
    setBookKeys(bookKeys);
  };

  const handleDelete = async (key: IDBValidKey) => {
    await deleteBook(Number(key));
    await loadBooks();
  };

  useEffect(() => {
    if (!isLoading) {
      loadBooks();
    }
  }, [isLoading]);

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
              <Card key={key.toString()} className="h-full hover:shadow-lg transition-shadow">
                <Link href={`/read/${key}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[2/3] bg-muted rounded-md flex items-center justify-center">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Book size={48} className="text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                    {book.finished ? (
                      <div className="flex items-center text-green-600 text-xs mt-1">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Finished
                      </div>
                    ) : typeof book.progressPercent === "number" ? (
                      <span className="text-xs text-muted-foreground mt-1">
                        {book.progressPercent}%
                      </span>
                    ) : null}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Delete book">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete this book?</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground">
                        This will remove the book from your library and delete it from the database.
                      </p>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button variant="destructive" onClick={() => handleDelete(key)}>
                            Delete
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
