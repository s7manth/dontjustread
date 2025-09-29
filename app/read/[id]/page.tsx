"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Reader } from "@/components/reader";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useDB } from "@/context/db-context";

export default function ReadPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { hasBook, getReadingSettings, getBookMetadata, isLoading: dbLoading } = useDB();
  const [headerStyle, setHeaderStyle] = useState<{ background: string; color: string }>({ background: "#ffffff", color: "#111111" });
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
  }, [params.id, router, hasBook, getReadingSettings, getBookMetadata, dbLoading]);

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
      <div className="p-4 flex items-center" style={{ background: headerStyle.background, color: headerStyle.color }}>
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mr-4"
          style={{ background: headerStyle.color, color: headerStyle.background }}
        >
          <ChevronLeft size={16} className="mr-2" />
          Back to Library
        </Button>
        <div>
          <h1 className="font-semibold">{title}</h1>
          <p className="text-sm">By {author}</p>
        </div>
      </div>
      <div className="flex-1 h-full w-full">
        <Reader
          bookId={book}
          initialSettings={initialSettings ?? undefined}
          onSettingsChange={(s) => setHeaderStyle({ background: s.background, color: s.color })}
        />
      </div>
    </div>
  );
}
