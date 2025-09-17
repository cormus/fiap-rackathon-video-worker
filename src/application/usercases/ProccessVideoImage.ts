import { QueueMessageMovieBody } from "../../domain/entities/QueueMessageMovieBody";
import { QueueMessageZipBody } from "../../domain/entities/QueueMessageZipBody";
import { Status } from "../../domain/enumeration/Status";
import { CompressorFile } from "../../domain/ports/CompressorFile";
import { FolderManager } from "../../domain/ports/FolderManager";
import { MessageQueue } from "../../domain/ports/MessageQueue";
import { Storage } from "../../domain/ports/Storage";
import { VideoProcessor } from "../../domain/ports/VideoProcessor";

export class ProccessVideoImage {

    private FRAME_SIZE: number = 4;

    private ZIP_TEMP_ID: string;
    private ZIP_TEMP_NAME: string;
    private ZIP_TEMP_DIR: string;
    private ZIP_TEMP_PATH: string;
    private IMAGE_TEMP_DIR: string;
    private VIDEO_TEMP_DIR: string;
    private ZIP_MIME_TYPE: string = "application/zip";

    constructor(
        private folderManager: FolderManager,
        private storage: Storage,
        private videoQueue: MessageQueue,
        private imageQueue: MessageQueue,
        private videoProcessor: VideoProcessor,
        private ConpressorFile: CompressorFile
    ){
        this.ZIP_TEMP_ID = this.folderManager.tempDirNameGenerator();
        this.ZIP_TEMP_NAME = `${this.ZIP_TEMP_ID}.zip`;
        this.ZIP_TEMP_DIR = `temp/${this.ZIP_TEMP_ID}`;
        this.ZIP_TEMP_PATH = `temp/${this.ZIP_TEMP_ID}/${this.ZIP_TEMP_NAME}`;
        this.IMAGE_TEMP_DIR = `${this.ZIP_TEMP_DIR}/images`;
        this.VIDEO_TEMP_DIR = `${this.ZIP_TEMP_DIR}/videos`;
    }

    // async execute(videoPath: string, outputDir:string): Promise<Buffer> {
    //     // processar a imagem do vídeo
    //     await this.processVideo(videoPath, outputDir, this.FRAME_SIZE);
    //     //realiza a compressão da pasta em um buffer zip
    //     return await this.compressFrames(outputDir);
    // }

    async execute(){
        const lista = await this.videoQueue.receiveMessages();

        lista.forEach(async (data) => {
            const message = data as QueueMessageMovieBody;
            if(message.status === Status.PENDING || message.status === Status.ERROR){
                try{
                    const fileBuffer = await this.storage.getFile(message.videoPath);

                    const VIDEO_TEMP_PATH: string = `${this.ZIP_TEMP_DIR}/${message.videoPath}`;

                    this.folderManager.createFolder(this.IMAGE_TEMP_DIR);
                    this.folderManager.createFolder(this.VIDEO_TEMP_DIR);

                    this.folderManager.writeFile(VIDEO_TEMP_PATH, fileBuffer);

                    // processar a imagem do vídeo
                    await this.processVideo(VIDEO_TEMP_PATH, this.IMAGE_TEMP_DIR, this.FRAME_SIZE);
                    //realiza a compressão da pasta em um buffer zip
                    const zipBuffer = await this.compressFrames(this.IMAGE_TEMP_DIR);
                    //envia o buffer zip para o armazenamento
                    await this.storage.uploadFile(`imagens/${this.ZIP_TEMP_NAME}`, zipBuffer, this.ZIP_MIME_TYPE);
                    //exclui o vídeo do armazenamento
                    await this.storage.deleteFile(message.videoPath);
                    //remove item da vila de processamento
                    await this.videoQueue.deleteMessage(message.id);
                    //deleta a pasta temporária
                    this.folderManager.deleteFolder(this.ZIP_TEMP_DIR);
                    //envia o zip para a fila de imagens
                    const queueMessageZipBody:QueueMessageZipBody = new QueueMessageZipBody(
                        Status.PROCESSING,
                        `imagens/${this.ZIP_TEMP_NAME}`
                    );
                    await this.imageQueue.sendMessage(queueMessageZipBody);
                } catch (error) {
                    console.error("Erro ao processar o vídeo: ", error);
                    //atualiza o status da mensagem para ERROR
                    message.status = Status.ERROR;
                    await this.videoQueue.sendMessage(message);
                }
            }
        });

        
    }

    async processVideo(videoPath: string, outrputPath:string, frameSize: number): Promise<void> {
        return await this.videoProcessor.extractFrames(videoPath, outrputPath, frameSize);
    }

    async compressFrames(outputDir: string): Promise<Buffer> {
        const zipBuffer = await this.ConpressorFile.createZip(outputDir);
        return zipBuffer;
    }

}