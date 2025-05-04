'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className="hover:border-muted-foreground cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition"
    >
      <input {...getInputProps()} />
      <div className="text-muted-foreground flex flex-col items-center justify-center space-y-2 text-sm">
        <div className="bg-muted-foreground rounded-full p-2">
          <UploadCloud className="h-6 w-6 text-white" />
        </div>
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>
            Click to browse or drag and drop your <code>.svs</code> files
          </p>
        )}
      </div>
    </div>
  );
};
