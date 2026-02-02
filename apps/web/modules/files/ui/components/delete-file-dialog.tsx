"use client"

import { useMutation } from "convex/react"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@workspace/ui/components/dialog"
import { api } from "@workspace/backend/_generated/api"
import type { PublicFile } from "@workspace/backend/private/files"

interface DeleteFileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: PublicFile | null;
    onDeleted?: () => void;
}

export const DeleteFileDialog = ({
    open,
    onOpenChange,
    file,
    onDeleted
}: DeleteFileDialogProps) => {
// getting the delete mutation hook ready. initializing the loading state
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteFile = useMutation(api.private.files.deleteFile);

// actual delete function. checks if we have a file, calls api, and then closes the dialog
    const handleDelete = async () => {
        if (!file) return;
        setIsDeleting(true);
        try {
            await deleteFile({ entryId: file.id });
            onOpenChange(false);
            onDeleted?.();
        } catch (error) {
            console.error("Failed to delete file:", error);
        } finally {
            setIsDeleting(false);
        }
    };

// standard dialog for confirmation shows the filename so the user knows exactly what they're deleting
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Delete File</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{file?.name}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button disabled={isDeleting} variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || !file}>
                        {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}