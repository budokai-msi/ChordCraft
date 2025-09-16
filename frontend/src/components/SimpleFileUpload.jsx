import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileAudio, 
  X, 
  CheckCircle, 
  AlertCircle,
  Music,
  Mic,
  Loader2
} from 'lucide-react';

export function SimpleFileUpload({ onAnalysisComplete, className = '' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [supportedFormats] = useState(['.wav', '.mp3', '.m4a', '.flac', '.ogg']);
  
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = async (file) => {
    setError(null);
    
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      setError(`Unsupported file format. Please use: ${supportedFormats.join(', ')}`);
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 100MB.');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsUploading(false);
          // Simulate analysis completion
          setTimeout(() => {
            if (onAnalysisComplete) {
              onAnalysisComplete({
                success: true,
                message: 'Audio file uploaded successfully!',
                fileName: file.name,
                fileSize: file.size,
                duration: '3:45' // Mock duration
              });
            }
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={`glass-pane ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Audio Upload
        </CardTitle>
        <CardDescription>
          Upload audio files for AI analysis and processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
            ${isDragging 
              ? 'border-blue-400 bg-blue-500/10' 
              : 'border-gray-600 hover:border-blue-400 hover:bg-blue-500/5'
            }
            ${error ? 'border-red-400 bg-red-500/10' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={supportedFormats.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Upload audio file"
          />
          
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto text-blue-400 animate-spin" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Uploading...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-400">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : uploadedFile ? (
            <div className="space-y-4">
              <CheckCircle className="w-12 h-12 mx-auto text-green-400" />
              <div>
                <p className="text-lg font-medium text-green-400">Upload Complete!</p>
                <p className="text-sm text-gray-400">{uploadedFile.name}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Music className="w-12 h-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium">Drop audio files here or click to browse</p>
                <p className="text-sm text-gray-400">
                  Supported formats: {supportedFormats.join(', ')}
                </p>
                <p className="text-xs text-gray-500 mt-2">Maximum file size: 100MB</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {uploadedFile && !isUploading && (
          <div className="mt-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileAudio className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
