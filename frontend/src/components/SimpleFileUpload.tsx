"use client";
import React, { useState, useRef } from "react";
import { Upload, Music, FileAudio, Loader2 } from "lucide-react";
import { HapticButton } from "./HapticButton";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  audioBuffer?: ArrayBuffer;
  generatedCode?: string;
}

interface SimpleFileUploadProps {
  onUpload: (result: FileUploadResult) => void;
}

export function SimpleFileUpload({ onUpload }: SimpleFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/aac'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|aac|m4a)$/i)) {
      alert('Please select a valid audio file (MP3, WAV, OGG, AAC)');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Haptic feedback for upload start
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([10, 5, 10]);
    }

    try {
      // Create FormData for backend upload
      const formData = new FormData();
      formData.append('audio', file);

      // Upload to backend for analysis
      const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/upload-audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUploadProgress(100);
        
        const uploadResult: FileUploadResult = {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          audioBuffer: await file.arrayBuffer(),
          generatedCode: result.code // Include the AI-generated code
        };

        onUpload(uploadResult);
        
    // Success haptic feedback
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 10, 20]);
    }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Error haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <motion.div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-primary bg-primary/10 scale-105' 
              : isUploading
              ? 'border-green-500 bg-green-500/10'
              : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={isDragging ? { scale: 1.02 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.aac,.m4a"
            onChange={handleFileChange}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-12 h-12 mx-auto text-primary" />
                </motion.div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uploading audio file...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <motion.div
                  animate={isDragging ? { scale: 1.2 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDragging ? (
                    <FileAudio className="w-12 h-12 mx-auto text-primary" />
                  ) : (
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  )}
                </motion.div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">
                    {isDragging ? 'Drop your audio file here' : 'Upload Audio File'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports MP3, WAV, OGG, AAC files
                  </p>
                </div>

                <HapticButton
                  onClick={handleFileSelect}
                  variant="outline"
                  hapticType="medium"
                  className="mt-4"
                >
                  <Music className="w-4 h-4 mr-2" />
                  Choose File
                </HapticButton>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </CardContent>
    </Card>
  );
}