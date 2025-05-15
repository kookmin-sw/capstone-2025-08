'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadDropzone } from '@/components/common/upload-dropzone';
import { X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ImageUploadModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'append';
  onPrevious?: () => void;
  onCreateSubmit?: (files: File[]) => void;
  onAppendSubmit?: (files: File[]) => void;
}

type FileStatus = 'uploading' | 'done' | 'error';

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  open,
  onClose,
  mode,
  onPrevious,
  onCreateSubmit,
  onAppendSubmit,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [prevFiles, setPrevFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [uploadStatus, setUploadStatus] = useState<Record<string, FileStatus>>(
    {},
  );
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
    setUploadComplete(false);
  };

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setPrevFiles([]);
      setUploadProgress({});
      setUploadStatus({});
      setUploadComplete(false);
    }
  }, [open]);

  const handleUpload = (newFiles: File[]) => {
    newFiles.forEach((file) => {
      if (uploadStatus[file.name] === 'done') return;

      const isValid = file.name.endsWith('.svs');

      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 0,
      }));

      setUploadStatus((prev) => ({
        ...prev,
        [file.name]: 'uploading',
      }));

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const current = prev[file.name] || 0;
          const next = Math.min(current + 10, 100);

          if (next >= 100) {
            clearInterval(interval);

            setUploadStatus((prevStatus) => ({
              ...prevStatus,
              [file.name]: isValid ? 'done' : 'error',
            }));
          }

          return {
            ...prev,
            [file.name]: next,
          };
        });
      }, 100);
    });
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setPrevFiles((prev) => prev.filter((f) => f.name !== fileName));
    setUploadProgress((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [fileName]: _, ...rest } = prev;
      return rest;
    });
    setUploadStatus((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [fileName]: _, ...rest } = prev;
      return rest;
    });
  };

  useEffect(() => {
    if (files.length === 0) return;

    const prevFileNames = new Set(prevFiles.map((f) => f.name));
    const newFiles = files.filter((f) => !prevFileNames.has(f.name));

    if (newFiles.length > 0) {
      handleUpload(newFiles);
      setPrevFiles(files);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(() => {
    if (files.length === 0) return;

    const allComplete = files.every(
      (file) =>
        uploadStatus[file.name] === 'done' ||
        uploadStatus[file.name] === 'error',
    );

    if (allComplete) {
      setUploadComplete(true);
    }
  }, [uploadStatus, files]);

  const handleSubmit = () => {
    const validFiles = files.filter(
      (file) => uploadStatus[file.name] === 'done',
    );

    if (mode === 'create') {
      if (onCreateSubmit) {
        onCreateSubmit(validFiles);
      }
    } else if (mode === 'append') {
      if (onAppendSubmit) onAppendSubmit(validFiles);
    }

    onClose();
  };

  const successfulCount = files.filter(
    (f) => uploadStatus[f.name] === 'done',
  ).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload SVS File</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <UploadDropzone onFilesSelected={handleFilesSelected} />
        </div>

        {files.length > 0 && (
          <div>
            {uploadComplete ? (
              <p className="mb-2 font-medium">
                Uploaded: {successfulCount} of {files.length} successful
              </p>
            ) : (
              <p className="mb-2 font-medium">
                Uploading files... ({files.length}/{files.length})
              </p>
            )}

            <div className="scroll-hide-track max-h-[200px] overflow-y-auto pr-2">
              {files.map((file) => {
                const status = uploadStatus[file.name];
                const progress = uploadProgress[file.name] || 0;

                return (
                  <div
                    key={file.name}
                    className={`my-2 rounded border px-3 py-2 text-sm transition-all ${
                      status === 'done'
                        ? 'border-green-600 text-green-600'
                        : status === 'error'
                        ? 'border-destructive text-destructive'
                        : 'border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{file.name}</span>
                      <div className="flex-shrink-0 pl-2">
                        {status === 'done' && (
                          <div className="rounded-full bg-green-600 p-0.5">
                            <X
                              className="h-3 w-3 cursor-pointer text-white"
                              onClick={() => handleRemoveFile(file.name)}
                            />
                          </div>
                        )}
                        {status === 'error' && (
                          <div className="bg-destructive rounded-full p-0.5">
                            <X
                              className="h-3 w-3 cursor-pointer text-white"
                              onClick={() => handleRemoveFile(file.name)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {status === 'uploading' && (
                      <Progress value={progress} className="mt-2 h-1" />
                    )}

                    {status === 'done' && (
                      <p className="mt-1 text-xs text-green-600">
                        Upload completed. This file is ready to use.
                      </p>
                    )}

                    {status === 'error' && (
                      <p className="text-destructive mt-1 text-xs">
                        This file type is not supported. Please delete and try
                        again.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2">
          {mode === 'create' && (
            <Button
              variant="outline"
              onClick={onPrevious}
              className="min-w-[80px]"
            >
              Previous
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            className="min-w-[80px]"
            disabled={!uploadComplete}
          >
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
