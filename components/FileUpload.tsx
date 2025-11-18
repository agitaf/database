import React, { useRef, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { FileIcon } from './icons/FileIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onClear: () => void;
  fileName: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onClear, fileName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };
  
  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClear();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
      onFileSelect(file);
    }
  };


  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-700/50 transition-colors duration-500">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Upload Your Data File</h2>
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}`}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <UploadIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">CSV or XLSX file</p>
        </div>
      </div>
      {fileName && (
        <div className="mt-4 flex items-center justify-between bg-blue-50 dark:bg-slate-700 p-3 rounded-lg border border-blue-200 dark:border-slate-600">
          <div className="flex items-center space-x-3">
            <FileIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{fileName}</span>
          </div>
          <button onClick={handleClear} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};