import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { openDB } from "idb";

const initDB = async () => {
  return openDB("epubReaderDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("epubFiles")) {
        db.createObjectStore("epubFiles");
      }
    },
  });
};

export function UploadBook({
  onUploadComplete,
}: {
  onUploadComplete: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/epub+zip") {
        setFile(selectedFile);
        // Try to extract title from filename
        const fileName = selectedFile.name.replace(/\.epub$/, "");
        setTitle(fileName);
      } else {
        toast("Invalid file format");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);

    try {
      // Generate a unique ID for the book
      const bookId = Date.now().toString();

      // Store the file in IndexedDB
      const db = await initDB();
      await db.put("epubFiles", file, bookId);

      // Create a temporary blob URL for immediate use
      const blobUrl = URL.createObjectURL(file);

      // Get existing books metadata from local storage
      const existingBooksJSON = localStorage.getItem("books") || "[]";
      const existingBooks = JSON.parse(existingBooksJSON);

      // Create new book metadata object
      const newBook = {
        id: bookId,
        title: title || file.name.replace(/\.epub$/, ""),
        author: author || "Unknown",
        cover: "", // We'll add cover extraction later
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        tempBlobUrl: blobUrl, // Temporary URL for immediate use
        addedAt: new Date().toISOString(),
      };

      // Add new book metadata to the list
      const updatedBooks = [...existingBooks, newBook];
      localStorage.setItem("books", JSON.stringify(updatedBooks));

      toast("Book uploaded successfully");

      setFile(null);
      setTitle("");
      setAuthor("");
      setOpen(false);
      onUploadComplete();
    } catch (error) {
      console.error("Error uploading book:", error);
      toast("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add Book</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload ePub Book</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book-file">ePub File</Label>
            <Input
              id="book-file"
              type="file"
              accept=".epub"
              onChange={handleFileChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-title">Title (Optional)</Label>
            <Input
              id="book-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Book title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book-author">Author (Optional)</Label>
            <Input
              id="book-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Author name"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
