import { useEffect, useRef, useState } from "react";
import { Book as EPub } from "epubjs";
import { Button } from "@/components/ui/button";
import { ReaderSettings } from "@/components/reader-settings";
import { useDB } from "@/context/db-context";

const appDb = process.env.NEXT_PUBLIC_APP_DB!;
const booksTable = process.env.NEXT_PUBLIC_BOOKS_TABLE!;

interface ReaderProps {
  bookId: string;
}

export function Reader({ bookId }: ReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<EPub | null>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    fontSize: 16,
    lineHeight: 1.5,
    theme: "light",
    font: "inter",
  });

  const { getBook } = useDB();

  useEffect(() => {
    const loadBook = async () => {
      if (!viewerRef.current) {
        console.error("Viewer ref is not available");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching book from IndexedDB with ID:", bookId);
        const file = await getBook(Number(bookId));

        if (!file) {
          const errorMsg = "Book not found in IndexedDB";
          console.error(errorMsg);
          setError(errorMsg);
          setLoading(false);
          return;
        }

        const fileContents = await file.arrayBuffer();
        const arr = new Uint8Array(fileContents).subarray(0, 2);
        let header = "";
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }
        if (header !== "504b") {
          throw new Error("Invalid file: not an epub book");
        }

        console.log("Book file retrieved:", file);

        console.log("Creating new ePub instance: ", file);
        const newBook = new EPub(fileContents, {
          encoding: "epub",
        });

        console.log("Waiting for book to be ready");
        await new Promise<void>((resolve, reject) => {
          newBook.ready
            .then(() => {
              console.log("Book is ready");
              resolve();
            })
            .catch((err) => {
              console.error("Error in book.ready:", err);
              reject(err);
            });
        });

        setBook(newBook);

        if (!viewerRef.current) {
          throw new Error("Viewer element is no longer available");
        }

        console.log("Creating rendition");
        const viewerWidth = viewerRef.current.clientWidth;
        const viewerHeight = viewerRef.current.clientHeight;
        console.log(`Viewer dimensions: ${viewerWidth}x${viewerHeight}`);

        const newRendition = newBook.renderTo(viewerRef.current, {
          ignoreClass: "annotator-hl",
          width: "100%",
          height: "100%",
          spread: "auto",
          flow: "paginated",
          allowScriptedContent: true,
        });

        console.log("Waiting for rendition to be ready");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setRendition(newRendition);

        // Get the spine items (chapters) and display the first content chapter instead of cover
        const spine = newBook.spine.hooks.content.list();
        console.log("Book spine items:", spine.length);

        // Find the first content chapter (usually after cover, title page, etc.)
        // Usually the first real content is a few items in
        const startPosition = 1; // Skip cover page (index 0)

        console.log(
          "Displaying content starting from spine position:",
          startPosition
        );
        await newRendition.display(spine[startPosition]?.href || 0);

        console.log("Applying settings");
        newRendition.themes.fontSize(`${settings.fontSize}px`);
        newRendition.themes.default({
          body: {
            "font-family": settings.font,
            "line-height": settings.lineHeight,
          },
        });

        console.log("Book rendered successfully");
      } catch (error) {
        console.error("Error loading book:", error);
        setError(
          `Error loading book: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    loadBook();

    return () => {
      if (book) {
        console.log("Cleaning up book");
        book.destroy();
      }
    };
  }, [bookId]);

  const updateSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    if (!rendition) return;

    rendition.themes.fontSize(`${newSettings.fontSize}px`);
    rendition.themes.font(newSettings.font);
  };

  const handlePrevious = () => {
    if (rendition) {
      // Add a CSS transition to make page changes smoother
      if (viewerRef.current) {
        viewerRef.current.style.opacity = "0.3";
        viewerRef.current.style.transition = "opacity 0.1s ease-in-out";

        setTimeout(() => {
          rendition.prev();
          setTimeout(() => {
            if (viewerRef.current) {
              viewerRef.current.style.opacity = "1";
            }
          }, 50);
        }, 50);
      } else {
        rendition.prev();
      }
    }
  };

  const handleNext = () => {
    if (rendition) {
      // Add a CSS transition to make page changes smoother
      if (viewerRef.current) {
        viewerRef.current.style.opacity = "0.3";
        viewerRef.current.style.transition = "opacity 0.1s ease-in-out";

        setTimeout(() => {
          rendition.next();
          setTimeout(() => {
            if (viewerRef.current) {
              viewerRef.current.style.opacity = "1";
            }
          }, 50);
        }, 50);
      } else {
        rendition.next();
      }
    }
  };

  // Add initial styles to the viewer ref when the component mounts
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.style.transition = "opacity 0.1s ease-in-out";
    }
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex justify-between p-4 border-b">
        <Button onClick={handlePrevious}>Previous</Button>
        <ReaderSettings settings={settings} onUpdate={updateSettings} />
        <Button onClick={handleNext}>Next</Button>
      </div>

      {/* Add a background color that matches your theme to reduce the flash effect */}
      <div className="flex-1 relative bg-background">
        <div className="flex flex-col">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="bg-destructive text-destructive-foreground p-4 rounded-md max-w-md">
                <h3 className="font-bold mb-2">Error Loading Book</h3>
                <p>{error}</p>
              </div>
            </div>
          )}
        </div>

        <div ref={viewerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
