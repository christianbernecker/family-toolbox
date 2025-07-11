"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FileCheck, Upload, CheckCircle, AlertCircle, ArrowLeft, Clock, Trash2 } from "lucide-react";
import Link from "next/link";
import { PDFUpload } from "@/components/bauplan-checker/pdf-upload";
import { ProcessedPDF, PDFProcessor } from "@/lib/tools/integration/bauplan-checker/pdf-processor";

export default function BauplanCheckerPage() {
  const [processedPDFs, setProcessedPDFs] = useState<ProcessedPDF[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<ProcessedPDF | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock user ID - in real app, get from auth
  const userId = "user_123";
  const pdfProcessor = new PDFProcessor();

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      setLoading(true);
      const pdfs = await pdfProcessor.getProcessedPDFs(userId);
      setProcessedPDFs(pdfs);
    } catch (error) {
      console.error('Error loading PDFs:', error);
      setError('Fehler beim Laden der PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (pdf: ProcessedPDF) => {
    setProcessedPDFs(prev => [pdf, ...prev]);
    setSelectedPDF(pdf);
    setError(null);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleDeletePDF = async (pdfId: string) => {
    if (!confirm('Bauplan wirklich löschen?')) return;
    
    try {
      await pdfProcessor.deletePDF(pdfId, userId);
      setProcessedPDFs(prev => prev.filter(pdf => pdf.id !== pdfId));
      if (selectedPDF?.id === pdfId) {
        setSelectedPDF(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Fehler beim Löschen des Bauplans');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/tools">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Bauplan Checker
              </h1>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Neuen Bauplan hochladen
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Laden Sie Ihren PDF-Bauplan hoch für eine automatische DIN-Normen Compliance-Prüfung
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setError(null)}
                    className="ml-auto text-red-600 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Component */}
            <PDFUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              userId={userId}
            />

            {/* Selected PDF Details */}
            {selectedPDF && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Aktuell ausgewählter Bauplan
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dateiname:</span>
                    <span className="text-sm text-gray-900 dark:text-white">{selectedPDF.originalFilename}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dateigröße:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {pdfProcessor.formatFileSize(selectedPDF.fileSize)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                    <div className="flex items-center space-x-2">
                      {selectedPDF.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">Verarbeitet</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600 dark:text-yellow-400">Verarbeitung</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    className="w-full bg-gradient-to-r from-red-500 to-red-700"
                    disabled={selectedPDF.status !== 'completed'}
                  >
                    DIN-Normen Prüfung starten
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Previous Plans */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Vorherige Baupläne ({processedPDFs.length})
              </h3>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : processedPDFs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Noch keine Baupläne hochgeladen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {processedPDFs.map((pdf) => (
                    <div
                      key={pdf.id}
                      className={`
                        rounded-lg border p-3 cursor-pointer transition-all
                        ${selectedPDF?.id === pdf.id 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                      `}
                      onClick={() => setSelectedPDF(pdf)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {pdf.originalFilename}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(pdf.uploadTime)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {pdfProcessor.formatFileSize(pdf.fileSize)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {pdf.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePDF(pdf.id);
                            }}
                            className="text-red-600 hover:text-red-700 p-1 h-6 w-6"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 