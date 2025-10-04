"use client";

import { Reader } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { LoadingQuotes } from "@/components/loading-quotes";
import { useDB } from "@/context/db-context";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    hasBook,
    getReadingSettings,
    getBookMetadata,
    isLoading: dbLoading,
  } = useDB();
  const [headerStyle, setHeaderStyle] = useState<{
    background: string;
    color: string;
  }>({ background: "#ffffff", color: "#111111" });
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [initialSettings, setInitialSettings] = useState<{
    fontSize: number;
    lineHeight: number;
    font: string;
    background: string;
    color: string;
    presetId?: string;
  } | null>(null);

  useEffect(() => {
    if (dbLoading) return; // wait for DB to initialize
    const bookId = params.id as string;
    hasBook(Number(bookId))
      .then((exists) => {
        if (exists) {
          setBook(bookId);
          getReadingSettings(Number(bookId))
            .then((settings) => {
              if (settings) {
                setHeaderStyle({
                  background: settings.background,
                  color: settings.color,
                });
                setInitialSettings({
                  fontSize: settings.fontSize,
                  lineHeight: settings.lineHeight,
                  font: settings.font,
                  background: settings.background,
                  color: settings.color,
                  presetId: settings.presetId,
                });
              }
            })
            .catch(() => {});
          // Fetch and set book metadata (title and author)
          getBookMetadata(Number(bookId))
            .then((metadata) => {
              if (metadata) {
                setTitle(metadata.title || "Untitled");
                setAuthor(metadata.creator || "");
              }
            })
            .catch(() => {});
        } else {
          router.push("/");
        }
      })
      .finally(() => setLoading(false));
  }, [
    params.id,
    router,
    hasBook,
    getReadingSettings,
    getBookMetadata,
    dbLoading,
  ]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="flex h-screen w-screen flex-col">
      <div
        className="flex items-center p-4"
        style={{ background: headerStyle.background, color: headerStyle.color }}
      >
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mr-4 text-xl"
          style={{
            background: headerStyle.color,
            color: headerStyle.background,
          }}
        >
          <ChevronLeft size={16} className="mr-2" />
          Back to Library
        </Button>
        <div>
          <h1 className="font-semibold text-xl">{title}</h1>
          <p className="text-lg">By {author}</p>
        </div>
      </div>
      <div className="h-full w-full flex-1">
        <Reader
          bookId={book}
          initialSettings={initialSettings ?? undefined}
          onSettingsChange={(s) =>
            setHeaderStyle({ background: s.background, color: s.color })
          }
        />
      </div>
    </div>
  );
}
