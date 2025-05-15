'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  contents?: React.ReactNode;
  showPreview?: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onFilesSelected,
  contents = (
    <>
      Click to browse or drag and drop your <code>.svs</code> files
    </>
  ),
  showPreview = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);

      if (showPreview && acceptedFiles.length > 0) {
        const newUrls = acceptedFiles.map((file) => URL.createObjectURL(file));
        setFiles((prev) => [...prev, ...acceptedFiles]);
        setPreviewUrls((prev) => [...prev, ...newUrls]);
      }
    },
    [onFilesSelected, showPreview],
  );

  const removeFileAt = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className="hover:border-muted-foreground flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition"
    >
      <input {...getInputProps()} />
      {showPreview && previewUrls.length > 0 ? (
        <div className="flex w-full flex-wrap justify-start gap-4">
          {previewUrls.map((url, index) => (
            <div key={url} className="relative inline-block">
              <Image
                src={url}
                alt={`preview-${index}`}
                width={32}
                height={32}
                className="h-32 w-32 rounded-md object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFileAt(index);
                }}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-black shadow-sm"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground flex flex-col items-center justify-center space-y-2 text-sm">
          <div className="bg-muted-foreground rounded-full p-2">
            <UploadCloud className="h-6 w-6 text-white" />
          </div>
          {isDragActive ? <p>Drop the files here ...</p> : <p>{contents}</p>}
        </div>
      )}
    </div>
  );
};
