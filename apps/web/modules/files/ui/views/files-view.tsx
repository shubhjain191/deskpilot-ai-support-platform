"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { usePaginatedQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { PublicFile } from "@workspace/backend/private/files";
import { Button } from "@workspace/ui/components/button";
import { FileIcon, MoreHorizontalIcon, PlusIcon, TrashIcon } from "lucide-react";
import { Badge } from "@workspace/ui/components/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { UploadDialog } from "../components/upload-dialog";
import { useState } from "react";
import { DeleteFileDialog } from "../components/delete-file-dialog";

export const FilesView = () => {
// fetching the list of files here, using pagination to load them in chunks so the page doesn't get heavy
  const files = usePaginatedQuery(
    api.private.files.list,
    {},
    {
      initialNumItems: 10,
    },
  );

// hooking up the infinite scroll logic to automatically load more files when the user scrolls down
  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingFirstPage,
    isLoadingMore,
  } = useInfiniteScroll({
    status: files.status,
    loadMore: files.loadMore,
    loadSize: 10,
  });

// simple state management for our dialogs and keeping track of which file is currently being acted upon
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<PublicFile | null>(null);

// triggered when user clicks delete. saving the file to state so the dialog knows what to delete
  const handleDeleteClick = (file: PublicFile) => {
    setSelectedFile(file);
    setDeleteDialogOpen(true);
  };

  const handleFileDeleted = () => {
    setSelectedFile(null);
  };

// main layout for the files page renders the header the table of files with actions and the infinite scroll trigger at the bottom
  return (
     <>
     <DeleteFileDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      file={selectedFile}
      onDeleted={handleFileDeleted}
    />
     <UploadDialog
      open={uploadDialogOpen}
      onOpenChange={setUploadDialogOpen}
    />
    <div className="flex min-h-screen flex-col bg-muted p-8">
      <div className=" mx-auto w-full max-w-screen-md">
        {/* the main page header showing the title and subtitle for the knowledge base section */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Upload and manage documents for the AI assistant
          </p>
        </div>
        <div className="mt-8 rounded-lg border bg-background">
          {/* simple toolbar area currently just holds the add new button to trigger uploads */}
          <div className="flex items-center justify-end border-b px-6 py-4">
            <Button onClick={() => setUploadDialogOpen(true)}>
              <PlusIcon />
              Add New
            </Button>
          </div>
          <Table>
            {/* main table structure with headers defining our file columns */}
            <TableHeader>
              <TableRow>
                <TableHead className="px-6 py-4 font-medium">Name</TableHead>
                <TableHead className="px-6 py-4 font-medium">Type</TableHead>
                <TableHead className="px-6 py-4 font-medium">Size</TableHead>
                <TableHead className="px-6 py-4 font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingFirstPage ? (
                // showing a simple loading text while we fetch the first page of files
                <TableRow>
                  <TableCell className="text-center h-24" colSpan={4}>
                    Loading...
                  </TableCell>
                </TableRow>
              ) : files?.results?.length === 0 ? (
                // empty state to let the user know if they havent uploaded anything yet
                <TableRow>
                  <TableCell className="text-center h-24" colSpan={4}>
                    No Files Found
                  </TableCell>
                </TableRow>
              ) : (
                // iterating through the files list and rendering a row for each one with its details
                files?.results?.map((file) => (
                  <TableRow key={file.id} className="hover:bg-muted/50">
                    <TableCell className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <FileIcon />
                        {file.name}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium">
                      <Badge className="uppercase" variant={"outline"}>
                        {file.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-muted-foreground">
                      {file.size}
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="size-8 p-0"
                            size="sm"
                            variant="ghost"
                          >
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* dropdown menu for file actions right now just allows deleting */}
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteClick(file)}
                            >
                                <TrashIcon className="size-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {!isLoadingFirstPage && files.results.length > 0 && (
            <div className="border-t">
                {/* the invisible trigger element at the bottom that loads the next page when scrolled into view */}
                <InfiniteScrollTrigger
                    isLoadingMore={isLoadingMore}
                    canLoadMore={canLoadMore}
                    onLoadMore={handleLoadMore}
                    ref={topElementRef}
                />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};
