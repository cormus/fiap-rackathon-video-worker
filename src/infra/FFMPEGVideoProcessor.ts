import { VideoProcessor } from "../domain/ports/VideoProcessor";

const ffmpeg = require('fluent-ffmpeg');

export class FFMPEGVideoProcessor implements VideoProcessor {
    async extractFrames(videoPath:string, outputDir: string, frameSize: number): Promise<void>{
          await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
              .on('end', resolve)
              .on('error', reject)
              .screenshots({
                count: frameSize,
                folder: outputDir,
                filename: 'frame-%i.png'
              });
          });
    }
}