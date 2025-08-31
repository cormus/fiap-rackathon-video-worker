import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export class S3FileStorage {
    private s3: S3Client;
    private bucket: string;

    constructor(bucket: string, region: string) {
        this.s3 = new S3Client({ region });
        this.bucket = bucket;
    }

    async createFolder(folderName: string): Promise<void> {
        const key = folderName.endsWith('/') ? folderName : `${folderName}/`;
        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: "",
            })
        );
    }

    async uploadFile(folderName: string, fileName: string, fileBuffer: Buffer, contentType = "application/octet-stream"): Promise<void> {
        const key = folderName.endsWith('/') ? `${folderName}${fileName}` : `${folderName}/${fileName}`;
        await this.s3.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
            })
        );
    }
}