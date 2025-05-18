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
import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { openDB } from "idb";
import { Book as EPub } from "epubjs";

const appDb = process.env.NEXT_PUBLIC_APP_DB!;
const booksTable = process.env.NEXT_PUBLIC_BOOKS_TABLE!;
const booksMetadataTable = process.env.NEXT_PUBLIC_BOOKS_METADATA_TABLE!;

const initDB = async () => {
  return openDB(appDb, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(booksTable)) {
        db.createObjectStore(booksTable);
        db.createObjectStore(booksMetadataTable);
      }
    },
  });
};

export function FileUploader({
  onUploadComplete,
}: {
  onUploadComplete?: () => void;
}) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [author, setAuthor] = React.useState("");

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
    // const newBook = new EPub(file);

    setIsUploading(true);

    try {
      const bookId = Date.now().toString();

      const db = await initDB();
      await db.put(booksTable, file, bookId);

      toast.success("Book uploaded successfully");
      setFiles([]);
      setTitle("");
      setAuthor("");
      onUploadComplete?.();
      db.close();
    } catch (error) {
      toast.error("Failed to upload book");
      console.error("Error uploading book:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        maxFiles={1}
        maxSize={50 * 1024 * 1024} // 50MB max for ePub files
        className="w-full"
        value={files}
        onValueChange={setFiles}
        onFileReject={onFileReject}
        onFileValidate={onFileValidate}
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">
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

      <div className="flex justify-end gap-2 mt-4">
        <Button
          variant="outline"
          onClick={() => {
            setFiles([]);
            setTitle("");
            setAuthor("");
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
