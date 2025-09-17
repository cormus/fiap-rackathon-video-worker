import { Readable } from "stream";

export interface Storage {
    uploadFile(filePath: string, fileBuffer: Buffer, contentType: string): Promise<void>;
    streamToBuffer(stream: Readable): Promise<Buffer>;
    getFile(key: string): Promise<Buffer>;
    deleteFile(key: string): Promise<void>;
  }
  