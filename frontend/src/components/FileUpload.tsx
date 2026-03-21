"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudUploadAlt } from "@fortawesome/free-solid-svg-icons";

interface FileUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        onUpload(file);
      } else {
        alert("Please upload a .csv file");
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onUpload(file);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center transition-colors ${
        dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25"
      } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv"
        className="hidden"
        id="file-upload"
        onChange={handleChange}
        disabled={isLoading}
      />
      <label
        htmlFor="file-upload"
        className="flex flex-col items-center justify-center cursor-pointer"
      >
        <FontAwesomeIcon icon={faCloudUploadAlt} className="text-4xl text-muted-foreground mb-4" />
        <p className="mb-2 text-sm text-foreground">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          CSV dump from Freshdesk (Max 10MB)
        </p>
      </label>
      {isLoading && (
        <div className="mt-4 text-sm text-primary animate-pulse">
          Processing data...
        </div>
      )}
    </div>
  );
}
