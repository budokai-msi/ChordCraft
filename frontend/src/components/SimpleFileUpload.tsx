"use client";
import React, { useState, useRef } from "react";
import { Upload, FileAudio, Loader2, Music } from "lucide-react";
import { HapticButton } from "./HapticButton";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { chordCraftDecoder, ChordCraftSong } from "../utils/ChordCraftDecoder";

interface FileUploadResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  audioBuffer?: ArrayBuffer;
  generatedCode?: string;
  chordCraftSong?: ChordCraftSong;
  playbackStrategy?: "lossless" | "neural" | "synthetic";
}

interface SimpleFileUploadProps {
  onUpload: (result: FileUploadResult) => void;
}

export function SimpleFileUpload({ onUpload }: SimpleFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backendUrl =
    (import.meta as any).env?.VITE_BACKEND_URL || "http://127.0.0.1:5000";

  const validFile = (f: File) =>
    ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4"].includes(
      f.type
    ) || /\.(mp3|wav|ogg|aac|m4a|flac)$/i.test(f.name);

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
    if (files.length > 0) handleFileUpload(files[0]);
  };
  const handleFileSelect = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileUpload(f);
  };

  const handleFileUpload = async (file: File) => {
    if (!validFile(file)) {
      alert("Please select a valid audio file (MP3/WAV/OGG/AAC/M4A/FLAC).");
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    if (navigator.vibrate) navigator.vibrate([10, 5, 10]);

    try {
      // Use XHR to get real progress
      const fd = new FormData();
      fd.append("audio", file);

      const url = `${backendUrl}/analyze`;
      const xhr = new XMLHttpRequest();
      const promise: Promise<string> = new Promise((resolve, reject) => {
        xhr.open("POST", url, true);
        xhr.responseType = "json";
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Expecting: { success: true, code: "..." }
            const body = xhr.response || {};
            if (body.success && typeof body.code === "string") {
              resolve(body.code);
            } else {
              reject(
                new Error(
                  body.error || "Unexpected response (missing code field)"
                )
              );
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.send(fd);
      });

      const code = await promise;
      setUploadProgress(100);

      // Try to parse ChordCraft v2
      let song: ChordCraftSong | undefined;
      let strategy: "lossless" | "neural" | "synthetic" = "synthetic";
      try {
        song = await chordCraftDecoder.parseChordCraftCode(code);
        strategy = chordCraftDecoder.getPlaybackStrategy(song);
      } catch (e) {
        console.warn("ChordCraft parse failed (still OK for plain text code):", e);
      }

      const uploadResult: FileUploadResult = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        audioBuffer: await file.arrayBuffer(),
        generatedCode: code,
        chordCraftSong: song,
        playbackStrategy: strategy,
      };

      onUpload(uploadResult);
      if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err?.message || "Unknown error"}`);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
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
              ? "border-primary bg-primary/10 scale-105"
              : isUploading
              ? "border-green-500 bg-green-500/10"
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5"
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
            accept="audio/*,.mp3,.wav,.ogg,.aac,.m4a,.flac"
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
                  <p className="text-sm font-medium">Uploading & analyzing…</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress}% complete
                  </p>
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
                    {isDragging ? "Drop your audio file here" : "Upload Audio File"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    MP3, WAV, OGG, AAC, M4A, FLAC
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