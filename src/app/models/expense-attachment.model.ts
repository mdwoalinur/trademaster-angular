

export interface ExpenseAttachment {
  attachmentId?: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: string;
}