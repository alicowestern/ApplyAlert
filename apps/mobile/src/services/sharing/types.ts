export type SharedContentType =
  | 'TEXT'
  | 'URL'
  | 'IMAGE'
  | 'PDF'
  | 'MULTIPLE'
  | 'UNKNOWN';

export interface SharedFile {
  uri: string;
  mimeType?: string;
  fileName?: string;
  size?: number;
}

export interface SharedContent {
  type: SharedContentType;
  text?: string;
  url?: string;
  files?: SharedFile[];
  sourcePackage?: string;
}

export interface ShareReceiver {
  getInitialShare(): Promise<SharedContent | null>;
  onShareReceived(callback: (content: SharedContent) => void): () => void;
}
