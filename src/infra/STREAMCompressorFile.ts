import { CompressorFile } from "../domain/ports/CompressorFile";

const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const { Writable } = require('stream');

export class STREAMCompressorFile implements CompressorFile {
    async createZip(outputDir: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            const writableStream = new Writable({
                write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void) {
                    console.log("encoding", encoding);
                    chunks.push(chunk);
                    callback();
                }
            });

            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(writableStream);

            fs.readdirSync(outputDir).forEach((file:string) => {
                archive.file(path.join(outputDir, file), { name: file });
            });

            archive.finalize();

            writableStream.on('finish', () => {
                resolve(Buffer.concat(chunks));
            });

            archive.on('error', reject);
            writableStream.on('error', reject);
        });
    }

}