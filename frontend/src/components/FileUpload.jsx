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
import { apiService } from '../services/apiService';
import { useProjectStore } from '../stores/useProjectStore';
import { useUIStore } from '../stores/useUIStore';

export function FileUpload({ onAnalysisComplete, className = '' }) {
  const { updateCode, setMusicAnalysis } = useProjectStore();
  const { showSuccess, showError, setAnalyzing } = useUIStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
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
    setUploadedFile(null);
    setAnalysisResult(null);
    
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!supportedFormats.includes(fileExtension)) {
      setError(`Unsupported file format. Supported formats: ${supportedFormats.join(', ')}`);
      return;
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 50MB.');
      return;
    }

    setUploadedFile(file);
    await analyzeFile(file);
  };

  const analyzeFile = async (file) => {
    setIsUploading(true);
    setAnalyzing(true);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 200);

      const result = await apiService.analyzeAudio(file, {
        analysisType: 'muzic_enhanced'
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success && result.chordCraftCode) {
        setAnalysisResult(result);
        updateCode(result.chordCraftCode);
        setMusicAnalysis(result);
        showSuccess('Audio analysis completed successfully!');
        
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message);
      showError(error.message);
    } finally {
      setIsUploading(false);
      setAnalyzing(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className="border-2 border-dashed border-slate-600 hover:border-blue-500 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Audio Analysis
          </CardTitle>
          <CardDescription>
            Upload an audio file to generate ChordCraft code using AI analysis
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${isDragging 
                ? 'border-blue-500 bg-blue-50/10' 
                : 'border-slate-600 hover:border-slate-500'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={supportedFormats.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Analyzing audio...</p>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-slate-400">{Math.round(uploadProgress)}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-slate-400" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragging ? 'Drop your audio file here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    Supported formats: {supportedFormats.join(', ')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum file size: 50MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Uploaded File Info */}
          {uploadedFile && !isUploading && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileAudio className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-slate-400">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFile}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {analysisResult && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="font-medium text-green-400">Analysis Complete</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Analysis Type</p>
                  <Badge variant="secondary">{analysisResult.analysisType}</Badge>
                </div>
                {analysisResult.tempo && (
                  <div>
                    <p className="text-slate-400">Tempo</p>
                    <p className="font-medium">{analysisResult.tempo} BPM</p>
                  </div>
                )}
                {analysisResult.key && (
                  <div>
                    <p className="text-slate-400">Key</p>
                    <p className="font-medium">{analysisResult.key}</p>
                  </div>
                )}
                {analysisResult.duration && (
                  <div>
                    <p className="text-slate-400">Duration</p>
                    <p className="font-medium">{formatDuration(analysisResult.duration)}</p>
                  </div>
                )}
              </div>

              {analysisResult.chordCraftCode && (
                <div className="mt-3">
                  <p className="text-sm text-slate-400 mb-2">Generated Code Preview:</p>
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                      {analysisResult.chordCraftCode.substring(0, 200)}
                      {analysisResult.chordCraftCode.length > 200 && '...'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            
            {uploadedFile && !isUploading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => analyzeFile(uploadedFile)}
                className="flex-1"
              >
                <Mic className="w-4 h-4 mr-2" />
                Re-analyze
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
