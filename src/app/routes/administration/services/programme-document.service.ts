import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface IProgrammeDocument {
  id?: number;
  programme_id: number;
  category: string;
  category_id?: number;
  document_name: string;
  document_type: string;
  document_content: string; // base64 encoded
  uploaded_by?: string;
  uploaded_at?: string;
  file_size?: number; // calculated from base64 length
}

@Injectable({
  providedIn: 'root'
})
export class ProgrammeDocumentService {
  private readonly API_BASE = 'api/programme-documents';

  constructor(private http: HttpClient) { }

  /**
   * Get all documents for a specific programme
   */
  getDocumentsByProgramme(programmeId: number): Observable<any> {
    return this.http.get(`${this.API_BASE}/programme/${programmeId}`);
  }

  /**
   * Get a specific document by ID
   */
  getDocumentById(documentId: number): Observable<any> {
    return this.http.get(`${this.API_BASE}/${documentId}`);
  }

  /**
   * Upload a new document
   */
  uploadDocument(document: IProgrammeDocument): Observable<any> {
    return this.http.post(this.API_BASE, document);
  }

  /**
   * Update an existing document
   */
  updateDocument(documentId: number, document: IProgrammeDocument): Observable<any> {
    return this.http.put(`${this.API_BASE}/${documentId}`, document);
  }

  /**
   * Delete a document
   */
  deleteDocument(documentId: number): Observable<any> {
    return this.http.delete(`${this.API_BASE}/${documentId}`);
  }

  /**
   * Convert file to base64 string
   */
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Download document by converting base64 back to blob
   */
  downloadDocument(doc: IProgrammeDocument): void {
    const byteCharacters = atob(doc.document_content);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: doc.document_type });
    
    const url = window.URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = doc.document_name;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Calculate file size from base64 string
   */
  calculateFileSize(base64String: string): number {
    const padding = (base64String.match(/=/g) || []).length;
    return Math.floor((base64String.length * 3) / 4) - padding;
  }

  /**
   * Validate file size (10MB limit for base64)
   */
  validateFileSize(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  }
}
