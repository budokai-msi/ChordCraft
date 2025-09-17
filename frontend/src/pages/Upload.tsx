"use client";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileAudio, Music, ArrowRight } from 'lucide-react';
import { useChordCraftStore } from '../store/useChordCraftStore';
import { chordCraftDecoder } from '../utils/ChordCraftDecoder';
import { HapticButton } from '../components/HapticButton';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';

export default function UploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const {
    isUploading,
    uploadProgress,
    isAnalyzing,
    analysisProgress,
    setCode,
    setSong,
    setPlaybackStrategy,
    setUploading,
    setUploadProgress,
    setAnalyzing,
    setAnalysisProgress,
    setChecksumStatus,
    settings,
  } = useChordCraftStore();

  const validFile = (f: File) => {
    const validType = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", "audio/mp4"].includes(f.type) || 
                     /\.(mp3|wav|ogg|aac|m4a|flac)$/i.test(f.name);
    const maxSize = 80 * 1024 * 1024; // 80MB
    const validSize = f.size <= maxSize;
    
    if (!validSize) {
      alert(`File too large: ${(f.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 80MB.`);
      return false;
    }
    
    return validType;
  };

  const handleFileUpload = async (file: File) => {
    if (!validFile(file)) {
      alert("Please select a valid audio file (MP3/WAV/OGG/AAC/M4A/FLAC).");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setAnalyzing(true);
    setAnalysisProgress(0);
    setChecksumStatus(null);

    if (navigator.vibrate) navigator.vibrate([10, 5, 10]);

    try {
      const fd = new FormData();
      fd.append("audio", file);

      const url = `${settings.backendUrl}/analyze`;
      const xhr = new XMLHttpRequest();
      
      const promise: Promise<string> = new Promise((resolve, reject) => {
        xhr.open("POST", url, true);
        xhr.responseType = "json";
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const progress = Math.round((ev.loaded / ev.total) * 100);
            setUploadProgress(progress);
            setAnalysisProgress(progress * 0.3); // Upload is 30% of total
          }
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const body = xhr.response || {};
            if (body.success && typeof body.code === "string") {
              resolve(body.code);
            } else {
              reject(new Error(body.error || "Unexpected response"));
            }
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.send(fd);
      });

      setAnalysisProgress(30);
      const code = await promise;
      setUploadProgress(100);
      setAnalysisProgress(70);

      // Parse ChordCraft v2 code
      let song;
      let strategy: "lossless" | "neural" | "synthetic" = "synthetic";
      
      try {
        song = await chordCraftDecoder.parseChordCraftCode(code);
        strategy = chordCraftDecoder.getPlaybackStrategy(song);
        
        // Verify checksum for identical playback guarantee
        if (song && strategy === 'lossless') {
          const checksum = await chordCraftDecoder.verifyChecksum(song);
          setChecksumStatus({ 
            valid: checksum.valid, 
            hash: checksum.hash, 
            expected: checksum.expected 
          });
        }
      } catch (e) {
        console.warn("ChordCraft parse failed:", e);
      }

      setAnalysisProgress(100);
      setCode(code);
      setSong(song);
      setPlaybackStrategy(strategy);

      if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
      
      // Navigate to studio after a brief delay
      setTimeout(() => {
        navigate('/studio');
      }, 1000);

    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(`Upload failed: ${err?.message || "Unknown error"}`);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } finally {
      setUploading(false);
      setAnalyzing(false);
      setUploadProgress(0);
      setAnalysisProgress(0);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            ChordCraft Studio
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            Transform audio into playable code
          </p>
          <p className="text-sm text-slate-400">
            Upload your audio file to get started
          </p>
        </motion.div>

        {/* Upload Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-8">
            <motion.div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/10 scale-105"
                  : isUploading || isAnalyzing
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

              {isUploading || isAnalyzing ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FileAudio className="w-16 h-16 mx-auto text-primary" />
                  </motion.div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {isUploading ? "Uploading..." : "Analyzing..."}
                    </h3>
                    
                    <div className="space-y-2">
                      <Progress value={isUploading ? uploadProgress : analysisProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        {isUploading ? `${uploadProgress}% uploaded` : `${analysisProgress}% analyzed`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <motion.div
                    animate={isDragging ? { scale: 1.2 } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isDragging ? (
                      <FileAudio className="w-16 h-16 mx-auto text-primary" />
                    ) : (
                      <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                    )}
                  </motion.div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-medium">
                      {isDragging ? "Drop your audio file here" : "Upload Audio File"}
                    </h3>
                    <p className="text-muted-foreground">
                      Drag & drop or click to select
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MP3, WAV, OGG, AAC, M4A, FLAC • Max 80MB
                    </p>
                  </div>

                  <HapticButton
                    onClick={handleFileSelect}
                    variant="outline"
                    hapticType="medium"
                    className="mt-6"
                  >
                    <Music className="w-5 h-5 mr-2" />
                    Choose File
                  </HapticButton>
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="text-center p-4 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 mx-auto mb-2 text-primary">🎵</div>
            <h4 className="font-medium text-white">AI Analysis</h4>
            <p className="text-sm text-slate-400">Advanced audio processing</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 mx-auto mb-2 text-primary">⚡</div>
            <h4 className="font-medium text-white">Real-time Code</h4>
            <p className="text-sm text-slate-400">Instant ChordCraft generation</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-slate-800/50">
            <div className="w-8 h-8 mx-auto mb-2 text-primary">🎹</div>
            <h4 className="font-medium text-white">Live Playback</h4>
            <p className="text-sm text-slate-400">Hear your code as music</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
