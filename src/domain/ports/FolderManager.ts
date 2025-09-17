export interface FolderManager{
    deleteFolder(dirPath: string): void;
    createFolder(dirPath: string): void;
    writeFile(dirPath: string, data: Buffer | string): void;
    getFileExtension(fileName: string): string;
    tempDirNameGenerator(): string;
}