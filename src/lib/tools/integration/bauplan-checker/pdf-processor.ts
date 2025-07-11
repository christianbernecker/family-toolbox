import { getSupabaseClient } from '@/lib/utils/supabase-helper';

export interface ProcessedPDF {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  pageCount: number;
  textContent: string;
  textPreview: string;
  uploadTime: string;
  metadata: PDFMetadata;
  status: 'processing' | 'completed' | 'error';
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  hasImages: boolean;
  requiresOCR: boolean;
}

export interface UploadProgress {
  phase: 'upload' | 'extract' | 'analyze' | 'complete';
  progress: number;
  message: string;
}

export class PDFProcessor {
  private readonly maxFileSize = 50 * 1024 * 1024; // 50MB
  private readonly allowedExtensions = ['.pdf'];

  async validateFile(file: File): Promise<void> {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Nur PDF-Dateien sind erlaubt');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new Error(`Datei zu groß. Maximum: ${this.maxFileSize / 1024 / 1024}MB`);
    }

    // Basic PDF header validation
    const arrayBuffer = await file.slice(0, 1024).arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const header = new TextDecoder().decode(uint8Array.slice(0, 8));
    
    if (!header.startsWith('%PDF-')) {
      throw new Error('Ungültiges PDF-Format');
    }
  }

  async uploadAndProcess(
    file: File, 
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<ProcessedPDF> {
    
    try {
      // Validate file
      await this.validateFile(file);
      
      onProgress?.({
        phase: 'upload',
        progress: 0,
        message: 'Validiere Datei...'
      });

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}_${sanitizedName}`;
      
      onProgress?.({
        phase: 'upload',
        progress: 25,
        message: 'Lade Datei hoch...'
      });

      // Upload to Supabase Storage
      const supabase = getSupabaseClient();
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bauplan-uploads')
        .upload(`${userId}/${filename}`, file);

      if (uploadError) {
        throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
      }

      onProgress?.({
        phase: 'extract',
        progress: 50,
        message: 'Extrahiere Text aus PDF...'
      });

      // Create initial record
      const processedPDF: ProcessedPDF = {
        id: `pdf_${timestamp}`,
        filename,
        originalFilename: file.name,
        fileSize: file.size,
        pageCount: 0,
        textContent: '',
        textPreview: '',
        uploadTime: new Date().toISOString(),
        metadata: {
          hasImages: false,
          requiresOCR: false
        },
        status: 'processing'
      };

      // Store in database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .insert({
          id: processedPDF.id,
          user_id: userId,
          tool_id: 'bauplan-checker',
          filename,
          original_filename: file.name,
          mime_type: file.type,
          file_size: file.size,
          storage_path: uploadData.path,
          metadata: processedPDF.metadata,
          status: 'processing'
        });

      if (dbError) {
        throw new Error(`Datenbank-Fehler: ${dbError.message}`);
      }

      onProgress?.({
        phase: 'extract',
        progress: 75,
        message: 'Analysiere PDF-Struktur...'
      });

      // Process PDF in background (would normally call API route)
      // For now, return the initial structure
      onProgress?.({
        phase: 'complete',
        progress: 100,
        message: 'Upload abgeschlossen'
      });

      processedPDF.status = 'completed';
      return processedPDF;

    } catch (error) {
      console.error('PDF processing error:', error);
      throw error;
    }
  }

  async getProcessedPDFs(userId: string): Promise<ProcessedPDF[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('file_uploads')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_id', 'bauplan-checker')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Fehler beim Laden der PDFs: ${error.message}`);
    }

    return (data || []).map(item => ({
      id: item.id,
      filename: item.filename,
      originalFilename: item.original_filename,
      fileSize: item.file_size,
      pageCount: item.metadata?.pageCount || 0,
      textContent: item.metadata?.textContent || '',
      textPreview: item.metadata?.textPreview || '',
      uploadTime: item.created_at,
      metadata: item.metadata || {},
      status: item.status || 'completed'
    }));
  }

  async deletePDF(pdfId: string, userId: string): Promise<void> {
    // Get file info first
    const supabase = getSupabaseClient();
    const { data: fileData, error: fetchError } = await supabase
      .from('file_uploads')
      .select('storage_path')
      .eq('id', pdfId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      throw new Error(`PDF nicht gefunden: ${fetchError.message}`);
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('bauplan-uploads')
      .remove([fileData.storage_path]);

    if (storageError) {
      console.warn('Storage deletion warning:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('file_uploads')
      .delete()
      .eq('id', pdfId)
      .eq('user_id', userId);

    if (dbError) {
      throw new Error(`Fehler beim Löschen: ${dbError.message}`);
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 