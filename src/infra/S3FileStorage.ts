import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { createWriteStream } from "fs";

import { pipeline } from "stream";
import { promisify } from "util";
import { Storage } from "../domain/ports/Storage";

export class S3FileStorage implements Storage{
    private s3: S3Client;
    private bucket: string;

    constructor(bucket: string, region: string) {
        this.s3 = new S3Client({ region });
        this.bucket = bucket;
    }

    async uploadFile(filePath: string, fileBuffer: Buffer, contentType = "application/octet-stream"): Promise<void> {
        const data = await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: filePath,
                Body: fileBuffer,
                ContentType: contentType,
            })
        );
        console.log(`Arquivo enviado com sucesso: ${filePath}`, data);
    }

/**
     * Converte um stream (Readable) em um Buffer
     * @param stream - O stream de entrada (como response.Body do S3)
     */
    async streamToBuffer(stream: Readable): Promise<Buffer> {
        const chunks: Buffer[] = [];
        return new Promise((resolve, reject) => {
            stream.on("data", (chunk) => {
                chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            });
            stream.on("end", () => resolve(Buffer.concat(chunks)));
            stream.on("error", (err) => reject(err)); // Captura erros no stream
        });
    };

      // Ler arquivo do bucket
  async getFile(key: string): Promise<Buffer> {
    try {
        const params = {
        Bucket: this.bucket,
        Key: key,
        };

        const response = await this.s3.send(new GetObjectCommand(params));;

        if (!response.Body || !(response.Body instanceof Readable)) {
            throw new Error("Resposta inválida: Body ausente ou não é um stream legível.");
        }

        let totalBytes = 0;
        response.Body.on("data", (chunk) => {
            totalBytes += chunk.length;
        });

        response.Body.on("end", () => {
            console.log(`✅ Total de bytes recebidos da stream: ${totalBytes}`);
        });

      
        return this.streamToBuffer(response.Body);

    } catch (error) {
      console.error("Erro ao ler arquivo do S3:", error);
      throw error;
    }
  }

  // Excluir arquivo do bucket
  async deleteFile(key: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucket,
        Key: key,
      };

      await this.s3.send(new DeleteObjectCommand(params));
      console.log(`Arquivo excluído com sucesso: ${key}`);
    } catch (error) {
      console.error("Erro ao excluir arquivo do S3:", error);
      throw error;
    }
  }
}