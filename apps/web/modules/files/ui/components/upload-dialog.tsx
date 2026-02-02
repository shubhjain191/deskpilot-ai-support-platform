"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { useAction } from "convex/react";
import { useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@workspace/ui/components/dropzone";
import { api } from "@workspace/backend/_generated/api";
import { FileIcon } from "lucide-react";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileUploaded?: () => void;
}

export const UploadDialog = ({
  open,
  onOpenChange,
  onFileUploaded,
}: UploadDialogProps) => {
// setting up the mutation and local states for file object, upload progress, and form inputs
  const addFile = useAction(api.private.files.addFile);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    category: "",
    filename: "",
  });

// grabbing the dropped file and auto-filling the name input if it's empty
  const handleFiledrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      setUploadedFiles([file]);
      if (!uploadForm.filename) {
        setUploadForm((prev) => ({
          ...prev,
          filename: file.name,
        }));
      }
    }
  };

// sending the file to the server. converting blob to array buffer because that's what the backend expects
  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const blob = uploadedFiles[0];

      if (!blob) {
        return;
      }

      const filename = uploadForm.filename || blob.name;

      await addFile({
        bytes: await blob.arrayBuffer(),
        filename,
        category: uploadForm.category,
        mimeType: blob.type || "text/plain",
      });

      onFileUploaded?.();
      handleCancel();
    } catch (error) {
      console.error("Failed to upload file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setUploadedFiles([]);
    setUploadForm({
      category: "",
      filename: "",
    });
  };

// render logic for the modal. inputs for metadata and a dropzone area for the file itself
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload file to your Knowledge base for AI-powered search and
              retrieval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                className="w-full"
                id="category"
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                placeholder="e.g., Documentation, Support, Product"
                type="text"
                value={uploadForm.category}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filename">
                Filename
                <span className="text-muted-foreground text-xs">
                  (optional)
                </span>
              </Label>
              <Input
                className="w-full"
                id="filename"
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    filename: e.target.value,
                  }))
                }
                placeholder="Override default filename"
                type="text"
                value={uploadForm.filename}
              />
            </div>
            <Dropzone
              accept={{
                "application/pdf": [".pdf"],
                "application/msword": [".doc"],
                "text/plain": [".txt"],
                "text/markdown": [".md"],
                "text/csv": [".csv"],
              }}
              disabled={isUploading}
              maxFiles={1}
              onDrop={handleFiledrop}
              src={uploadedFiles}
            >
              <DropzoneEmptyState />
              <DropzoneContent />
            </Dropzone>
          </div>

          <DialogFooter>
            <Button
              disabled={isUploading}
              onClick={handleCancel}
              variant="outline"
            >
              cancel
            </Button>
            <Button
              disabled={
                uploadedFiles.length === 0 ||
                isUploading ||
                !uploadForm.category
              }
              onClick={handleUpload}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
