"use client";

import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import * as React from "react";

export function Header({
  onUploadComplete,
  onDuplicate,
}: {
  onUploadComplete?: () => void;
  onDuplicate?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="flex w-full items-center justify-between px-6 py-4">
      <h1 className="text-6xl font-bold">䷉dont just read</h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="text-3xl" size="lg">
            <PlusCircle className="mr-2 h-16 w-16" />
            Add a book
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload a book</DialogTitle>
          </DialogHeader>
          <FileUploader
            onUploadComplete={() => {
              setOpen(false);
              onUploadComplete?.();
            }}
            onDuplicate={() => {
              setOpen(false);
              onDuplicate?.();
            }}
          />
        </DialogContent>
      </Dialog>
    </header>
  );
}
