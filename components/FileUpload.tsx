import React, { useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0 && files[0].type === 'text/csv') {
        onFileSelect(files[0]);
    } else if (files && files.length > 0 && files[0].name.endsWith('.csv')) {
        // Fallback for systems that don't report text/csv MIME
        onFileSelect(files[0]);
    } else {
        alert("Please upload a valid CSV file.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div 
      className="w-full p-10 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer group"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleChange} 
        accept=".csv" 
        className="hidden" 
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        {isProcessing ? (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-lg font-medium text-slate-700">Analyzing your data...</p>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
                <p className="text-lg font-semibold text-slate-700">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-500 mt-1">CSV files only (max 10MB)</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;