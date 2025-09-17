import fs from 'fs';
import cuid from "cuid";
import { FolderManager } from '../../domain/ports/FolderManager';

export class FolderUtil implements FolderManager {
  /**
   * Exclui uma pasta recursivamente.
   * @param dirPath Caminho da pasta a ser excluída.
   */
  deleteFolder(dirPath: string): void {
    try {
      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`Pasta '${dirPath}' excluída com sucesso.`);
      } else {
        console.warn(`Pasta '${dirPath}' não encontrada.`);
      }
    } catch (error) {
      console.error(`Erro ao excluir a pasta '${dirPath}':`, error);
    }
  }

  /**
   * Cria uma pasta, incluindo diretórios intermediários, se necessário.
   * @param dirPath Caminho da pasta a ser criada.
   */
  createFolder(dirPath: string): void {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Pasta '${dirPath}' criada com sucesso.`);
      }
    } catch (error) {
      console.error(`Erro ao criar a pasta '${dirPath}':`, error);
    }
  }

  /**
   * Método para gravar arquivos em uma pasta específica.
   * @param dirPath Caminho da pasta onde o arquivo será salvo.
   * @param data Dados do arquivo (Buffer ou string).   
   */
  writeFile(dirPath: string, data: Buffer | string): void {
    try {
      fs.writeFileSync(dirPath, data);
      console.log(`Arquivo salvo em '${dirPath}' com sucesso.`);
    } catch (error) {
      console.error(`Erro ao salvar o arquivo em '${dirPath}':`, error);
    }
  }

  /**
   * Método para recupeara a extensão de um arquivo a partir do seu nome.
   * @param fileName Nome do arquivo (ex: imagem.png, video.mp4).
   * @returns A extensão do arquivo (ex: .png, .mp4) ou uma string vazia se não houver extensão.
   */
  getFileExtension(fileName: string): string {
    const ext = fileName.split('.').pop();
    return ext ? ext : '';
  }

  tempDirNameGenerator(): string {
    return cuid();
  }
}