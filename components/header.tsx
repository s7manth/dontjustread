"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileUploader } from "@/components/file-uploader";
import { toast } from "sonner";

export function Header({
  onUploadComplete,
  onDuplicate,
}: {
  onUploadComplete?: () => void;
  onDuplicate?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="w-full py-4 px-6 flex justify-between items-center">
      <h1 className="text-xl font-bold">Don&apos;t Just Read</h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
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
