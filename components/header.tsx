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

export function Header() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="w-full py-4 px-6 flex justify-between items-center border-b">
      <h1 className="text-xl font-bold">Don&apos;t Just Read</h1>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add a book
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload a book</DialogTitle>
          </DialogHeader>
          <FileUploader onUploadComplete={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}
