"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useDB } from "@/context/db-context";
import { Book, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const {
    getAllBooks,
    getAllBookKeys,
    getAllBookMetadata,
    deleteBook,
    isLoading,
  } = useDB();

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
        progressPercent:
          typeof m?.readingProgressPercent === "number"
            ? m.readingProgressPercent
            : undefined,
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
        <div className="rounded-lg border-2 border-dashed py-12 text-center">
          <div className="mb-4 flex justify-center">
            <Book size={48} className="text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-medium">No books yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first ePub book to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {bookKeys
            .map((bookKey, i) => {
              return { key: bookKey, book: books[i] };
            })
            .map(({ key, book }) => (
              <Card
                key={key.toString()}
                className="h-full transition-shadow hover:shadow-lg p-2 px-0"
              >
                <Link href={`/read/${key}`}>
                  <CardHeader className="flex flex-row justify-between pb-1">
                    <CardTitle className="line-clamp-2 text-2xl">{book.title}</CardTitle>
                    {book.finished ? (
                      <div className="mt-1 flex items-center text-lg text-green-600">
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Finished
                      </div>
                    ) : typeof book.progressPercent === "number" ? (
                      <span className="text-muted-foreground mt-1 text-lg">
                        {book.progressPercent}%
                      </span>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted flex aspect-[2/3] items-center justify-center rounded-md hover:shadow-lg">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        <Book size={48} className="text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="flex items-center justify-between">
                    <p className="text-muted-foreground text-xl italic">
                      {book.author}
                    </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        aria-label="Delete book"
                        className="p-2 text-md hover:bg-destructive/80 hover:text-destructive-foreground hover:text-white"
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogTitle className="text-muted-foreground text-3xl font-bold">
                        Are you sure? 🤔
                      </DialogTitle>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline" className="text-2xl">No, nevermind</Button>
                        </DialogClose> 
                        <DialogClose asChild>
                          <Button
                            variant="destructive"
                            onClick={() => handleDelete(key)}
                            className="text-2xl"
                          >
                            Heck yeah!
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
