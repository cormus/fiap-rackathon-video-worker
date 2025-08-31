import { CompressorFile } from "../../domain/ports/CompressorFile";
import { MessageQueue } from "../../domain/ports/MessageQueue";
import { VideoProcessor } from "../../domain/ports/VideoProcessor";

export class ProccessVideoImage {

    private FRAME_SIZE: number = 4;

    constructor(
        private messageQueue: MessageQueue,
        private videoProcessor: VideoProcessor,
        private ConpressorFile: CompressorFile
    ){}

    async execute(videoPath: string, outputDir:string): Promise<Buffer> {
        // processar a imagem do vídeo
        await this.processVideo(videoPath, outputDir, this.FRAME_SIZE);
        //realiza a compressão da pasta em um buffer zip
        return await this.compressFrames(outputDir);
    }

    async processVideo(videoPath: string, outrputPath:string, frameSize: number): Promise<void> {
        return await this.videoProcessor.extractFrames(videoPath, outrputPath, frameSize);
    }

    async compressFrames(outputDir: string): Promise<Buffer> {
        const zipBuffer = await this.ConpressorFile.createZip(outputDir);
        return zipBuffer;
    }

}