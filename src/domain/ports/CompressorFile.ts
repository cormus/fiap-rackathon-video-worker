
export interface CompressorFile {
  createZip(outputDir: string): Promise<Buffer>;
}
