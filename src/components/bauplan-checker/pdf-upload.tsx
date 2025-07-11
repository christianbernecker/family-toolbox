"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, FileText, X, AlertCircle, CheckCircle } from 'lucide-react';
import { PDFProcessor, ProcessedPDF, UploadProgress } from '@/lib/tools/integration/bauplan-checker/pdf-processor';

interface PDFUploadProps {
  onUploadSuccess: (pdf: ProcessedPDF) => void;
  onUploadError: (error: string) => void;
  userId: string;
  disabled?: boolean;
}

export function PDFUpload({ onUploadSuccess, onUploadError, userId, disabled }: PDFUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const pdfProcessor = new PDFProcessor();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || disabled) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setProgress({
      phase: 'upload',
      progress: 0,
      message: 'Starte Upload...'
    });

    try {
      const result = await pdfProcessor.uploadAndProcess(file, userId, (progressUpdate) => {
        setProgress(progressUpdate);
      });

      onUploadSuccess(result);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error instanceof Error ? error.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  }, [userId, disabled, onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: disabled || uploading,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  const getProgressIcon = () => {
    if (!progress) return <Upload className="h-8 w-8" />;
    
    switch (progress.phase) {
      case 'upload':
        return <Upload className="h-8 w-8 animate-pulse" />;
      case 'extract':
        return <FileText className="h-8 w-8 animate-pulse" />;
      case 'analyze':
        return <CheckCircle className="h-8 w-8 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      default:
        return <Upload className="h-8 w-8" />;
    }
  };

  const getProgressColor = () => {
    if (!progress) return 'bg-gray-200';
    
    switch (progress.phase) {
      case 'upload':
        return 'bg-blue-500';
      case 'extract':
        return 'bg-yellow-500';
      case 'analyze':
        return 'bg-purple-500';
      case 'complete':
        return 'bg-green-500';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
          ${isDragActive || dragActive 
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`
            flex h-16 w-16 items-center justify-center rounded-full 
            ${isDragActive || dragActive 
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }
          `}>
            {getProgressIcon()}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {uploading ? progress?.message || 'Verarbeite...' : 'PDF-Bauplan hochladen'}
            </h3>
            
            {!uploading ? (
              <p className="text-gray-600 dark:text-gray-300">
                PDF-Datei hierher ziehen oder{' '}
                <span className="text-red-600 dark:text-red-400 font-medium">
                  zum Durchsuchen klicken
                </span>
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                {progress?.phase === 'upload' && 'Lade Datei hoch...'}
                {progress?.phase === 'extract' && 'Extrahiere Text aus PDF...'}
                {progress?.phase === 'analyze' && 'Analysiere Bauplan...'}
                {progress?.phase === 'complete' && 'Upload abgeschlossen!'}
              </p>
            )}
          </div>
          
          {!uploading && (
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>Unterstützte Formate: PDF</p>
              <p>Maximale Dateigröße: 50MB</p>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        {uploading && progress && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span>{progress.progress}%</span>
              <span className="capitalize">{progress.phase}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Upload Guidelines */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Hinweise für optimale Ergebnisse:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
              <li>PDF-Qualität sollte gut lesbar sein</li>
              <li>Technische Zeichnungen werden automatisch erkannt</li>
              <li>Gescannte PDFs werden per OCR verarbeitet</li>
              <li>DIN-Normen werden automatisch abgeglichen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 