export interface VideoProcessor {
  extractFrames(videoPath: string, outputDir: string, frameSize: number): Promise<void>;
}
