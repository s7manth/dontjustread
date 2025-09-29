import { useEffect, useRef, useState } from "react";
import { Book as EPub } from "epubjs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ReaderSettings } from "@/components/reader-settings";
import { useDB } from "@/context/db-context";

interface ReaderProps {
  bookId: string;
  initialSettings?: {
    fontSize: number;
    lineHeight: number;
    theme?: string;
    font: string;
    background: string;
    color: string;
    presetId?: string;
  };
  onSettingsChange?: (settings: {
    fontSize: number;
    lineHeight: number;
    theme?: string;
    font: string;
    background: string;
    color: string;
    presetId?: string;
  }) => void;
}

export function Reader({ bookId, initialSettings, onSettingsChange }: ReaderProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<EPub | null>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(() => ({
    fontSize: initialSettings?.fontSize ?? 16,
    lineHeight: initialSettings?.lineHeight ?? 1.6,
    theme: initialSettings?.theme ?? "light",
    font: initialSettings?.font ?? "Inter",
    background: initialSettings?.background ?? "#ffffff",
    color: initialSettings?.color ?? "#111111",
    presetId: initialSettings?.presetId ?? "default",
  }));

  const { getBook, getReadingProgress, setReadingProgress, getReadingSettings, setReadingSettings } = useDB();

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

        // Generate locations once to enable percentage computation
        try {
          if (!newBook.locations || newBook.locations.length() === 0) {
            console.log("Generating locations for percentage calculation");
            await newBook.locations.generate(1000);
          }
        } catch (e) {
          console.warn("Failed to generate locations; percentage may be unavailable", e);
        }

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

        try {
          const savedSettings = await getReadingSettings(Number(bookId));
          if (savedSettings) {
            setSettings((prev) => ({ ...prev, ...savedSettings }));
            newRendition.themes.fontSize(`${savedSettings.fontSize}px`);
            newRendition.themes.default({
              body: {
                "font-family": savedSettings.font,
                "line-height": savedSettings.lineHeight,
                background: savedSettings.background,
                color: savedSettings.color || "#111111",
              },
            });
          } else {
            // Apply defaults when no saved settings exist
            newRendition.themes.fontSize(`${settings.fontSize}px`);
            newRendition.themes.default({
              body: {
                "font-family": settings.font,
                "line-height": settings.lineHeight,
                background: settings.background,
                color: settings.color || "#111111",
              },
            });
          }
        } catch {}

        // Try to restore last reading position first; otherwise start near content
        let displayed = false;
        try {
          const savedCfi = await getReadingProgress(Number(bookId));
          if (savedCfi) {
            console.log("Restoring saved location CFI", savedCfi);
            await newRendition.display(savedCfi);
            displayed = true;
          }
        } catch (e) {
          console.warn("No saved reading progress or failed to load:", e);
        }

        if (!displayed) {
          // Get the spine items (chapters) and display the first content chapter instead of cover
          const spine = newBook.spine.hooks.content.list();
          console.log("Book spine items:", spine.length);
          const startPosition = 1; // Skip cover page (index 0)
          console.log(
            "Displaying content starting from spine position:",
            startPosition
          );
          await newRendition.display(spine[startPosition]?.href || 0);
        }

        // Settings are already applied above based on saved/default values

        // Save progress on each relocation
        try {
          newRendition.on("relocated", async (location: any) => {
            try {
              const cfi = location?.start?.cfi || location?.end?.cfi;
              let percent: number | undefined = undefined;
              try {
                if (cfi && newBook.locations) {
                  const p = newBook.locations.percentageFromCfi(cfi);
                  if (typeof p === "number" && !Number.isNaN(p)) {
                    percent = Math.min(100, Math.max(0, Math.round(p * 100)));
                  }
                }
              } catch {}
              const isFinished = typeof percent === "number" ? percent >= 99 : false;
              if (cfi) {
                await setReadingProgress(Number(bookId), cfi, percent, isFinished);
              }
            } catch (err) {
              console.warn("Failed to persist reading progress", err);
            }
          });
        } catch {}

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
    try {
      onSettingsChange?.({
        fontSize: newSettings.fontSize,
        lineHeight: newSettings.lineHeight,
        theme: newSettings.theme,
        font: newSettings.font,
        background: newSettings.background,
        color: newSettings.color,
        presetId: newSettings.presetId,
      });
    } catch {}
    if (!rendition) return;

    rendition.themes.fontSize(`${newSettings.fontSize}px`);
    rendition.themes.default({
      body: {
        "font-family": newSettings.font,
        "line-height": newSettings.lineHeight,
        background: newSettings.background,
        color: newSettings.color,
      },
    });

    try {
      setReadingSettings(Number(bookId), {
        fontSize: newSettings.fontSize,
        lineHeight: newSettings.lineHeight,
        font: newSettings.font,
        background: newSettings.background,
        color: newSettings.color,
        presetId: newSettings.presetId,
      });
    } catch {}
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

  // Keyboard handling for navigation and settings
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Avoid interfering when typing in inputs or editable elements
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      // Cmd/Ctrl+K opens settings
      if ((event.metaKey || event.ctrlKey) && (event.key === "k" || event.key === "K")) {
        event.preventDefault();
        setIsSettingsOpen(true);
        return;
      }

      // Left/Right arrows for navigation
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false } as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  }, [rendition]);

  // Add initial styles to the viewer ref when the component mounts
  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.style.transition = "opacity 0.1s ease-in-out";
    }
  }, [settings]);

  return (
      <div className="flex flex-col h-full w-full">
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
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

      <div className="flex-1 relative" style={{ background: settings.background }}>
        <div ref={viewerRef} className="h-full w-full" />
      </div>
      <div
          className="flex justify-between p-4"
          style={{
            background: settings.background,
            color: settings.color,
            borderColor: settings.color,
          }}
        >
          <Button
            onClick={handlePrevious}
            style={{
              background: settings.color,
              color: settings.background,
              borderColor: settings.color,
            }}
            variant="outline"
          >
            <ArrowLeft size={16} className="mr-2" />
            <span>Previous</span>
          </Button>
          <ReaderSettings
            settings={settings}
            onUpdate={updateSettings}
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
            triggerStyle={{
              background: settings.color,
              color: settings.background,
              borderColor: settings.color,
            }}
          />
          <Button
            onClick={handleNext}
            style={{
              background: settings.color,
              color: settings.background,
              borderColor: settings.color,
            }}
            variant="outline"
          >
            <span>Next</span>
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
    </div>
  );
}
