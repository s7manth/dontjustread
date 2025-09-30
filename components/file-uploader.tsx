"use client";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import type { BookMetadata } from "@/context/db-context";
import { useDB } from "@/context/db-context";
import { Book as EPub } from "epubjs";
import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

export function FileUploader({
  onUploadComplete,
  onDuplicate,
}: {
  onUploadComplete?: () => void;
  onDuplicate?: () => void;
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const { addBook, addBookMetadata, getAllBookMetadata } = useDB();

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  }, []);

  const onFileValidate = React.useCallback((file: File) => {
    if (file.type !== "application/epub+zip") {
      return "Only ePub files are supported";
    }
    return null;
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }

    const file = files[0];

    const reader = new FileReader();
    try {
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });

      const arr = new Uint8Array(buffer).subarray(0, 2);
      const header = Array.from(arr)
        .map((b) => b.toString(16))
        .join("");

      if (header !== "504b") {
        toast.error("Invalid file format", {
          description: "Not a valid EPUB file",
        });
        return;
      }

      // Compute content hash for duplicate detection
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      try {
        const allMetadata = await getAllBookMetadata();
        const duplicate = allMetadata.find(
          (m) =>
            (m as any)?.contentHash && (m as any).contentHash === contentHash,
        ) as BookMetadata | undefined;
        if (duplicate) {
          setFiles([]);
          onDuplicate?.();
          return;
        }
      } catch (e) {
        console.warn("Duplicate check failed:", e);
      }

      const newBook = new EPub(reader.result as string);
      const rawMetadata = await newBook.loaded.metadata;
      const normalizedMetadata: BookMetadata = {
        title: (rawMetadata?.title || "").toString().trim(),
        creator: (rawMetadata?.creator || "").toString().trim(),
        series: (rawMetadata as any)?.series
          ? (rawMetadata as any).series.toString().trim()
          : "",
        seriesIndex:
          (rawMetadata as any)?.seriesIndex !== undefined &&
          (rawMetadata as any)?.seriesIndex !== null
            ? String((rawMetadata as any).seriesIndex)
                .toString()
                .trim()
            : "",
        description: (rawMetadata as any)?.description || "",
        language: (rawMetadata as any)?.language || "",
        publisher: (rawMetadata as any)?.publisher || "",
        rights: (rawMetadata as any)?.rights || "",
        modified_date:
          (rawMetadata as any)?.modified_date ||
          (rawMetadata as any)?.modified ||
          "",
        coverBlob: undefined,
        contentHash,
      };

      // Attempt to fetch cover from book state
      try {
        // epubjs exposes cover via book.archive.createUrl(book.cover) or via resources
        // When using the constructor with ArrayBuffer, newBook.cover may be an href
        const coverHref =
          (newBook as any)?.cover ||
          (newBook as any)?.packaging?.metadata?.cover;
        if (coverHref) {
          const coverBlob: Blob | undefined = await (newBook as any).archive
            .createUrl(coverHref)
            .then(async (url: string) => {
              const resp = await fetch(url);
              if (!resp.ok) return undefined;
              return await resp.blob();
            })
            .catch(() => undefined);
          if (coverBlob) {
            normalizedMetadata.coverBlob = coverBlob;
          }
        }
      } catch (e) {
        console.warn("Unable to resolve cover:", e);
      }

      setIsUploading(true);

      try {
        const bookId = Date.now();

        await addBook(bookId, file);
        await addBookMetadata(bookId, normalizedMetadata);
        toast.success("Book uploaded successfully");
        setFiles([]);
        onUploadComplete?.();
      } catch (error) {
        toast.error("Failed to upload book");
        console.error("Error uploading book:", error);
      } finally {
        setIsUploading(false);
      }
    } catch (error) {
      toast.error("Failed to read file");
      console.error("Error reading file:", error);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        maxFiles={1}
        maxSize={50 * 1024 * 1024}
        className="w-full"
        value={files}
        onValueChange={setFiles}
        onFileReject={onFileReject}
        onFileValidate={onFileValidate}
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="text-muted-foreground size-6" />
            </div>
            <p className="text-sm font-medium">
              Drag & drop your ePub file here
            </p>
            <p className="text-muted-foreground text-xs">
              Or click to browse (max 1 file, up to 50MB)
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Browse files
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file}>
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <X />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setFiles([]);
            onUploadComplete?.();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
    </div>
  );
}
