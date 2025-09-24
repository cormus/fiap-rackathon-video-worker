import fs from 'fs';
import { FolderUtil } from '../src/infra/util/FolderUtil';

// Mock do fs
jest.mock('fs');
jest.mock('cuid', () => jest.fn(() => 'test-cuid-123'));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('FolderUtil', () => {
  let folderUtil: FolderUtil;

  beforeEach(() => {
    folderUtil = new FolderUtil();
    jest.clearAllMocks();
  });

  describe('deleteFolder', () => {
    it('should delete folder when it exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.rmSync.mockImplementation(() => {});

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      folderUtil.deleteFolder('/test/path');

      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/path');
      expect(mockFs.rmSync).toHaveBeenCalledWith('/test/path', { recursive: true, force: true });
      expect(consoleSpy).toHaveBeenCalledWith("Pasta '/test/path' excluída com sucesso.");

      consoleSpy.mockRestore();
    });

    it('should warn when folder does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      folderUtil.deleteFolder('/test/path');

      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/path');
      expect(mockFs.rmSync).not.toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith("Pasta '/test/path' não encontrada.");

      consoleWarnSpy.mockRestore();
    });

    it('should handle errors when deleting folder', () => {
      mockFs.existsSync.mockReturnValue(true);
      const error = new Error('Permission denied');
      mockFs.rmSync.mockImplementation(() => {
        throw error;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      folderUtil.deleteFolder('/test/path');

      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/path');
      expect(mockFs.rmSync).toHaveBeenCalledWith('/test/path', { recursive: true, force: true });
      expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao excluir a pasta '/test/path':", error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('createFolder', () => {
    it('should create folder when it does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => '');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      folderUtil.createFolder('/test/path');

      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/path');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/path', { recursive: true });
      expect(consoleSpy).toHaveBeenCalledWith("Pasta '/test/path' criada com sucesso.");

      consoleSpy.mockRestore();
    });

    it('should not create folder when it already exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      folderUtil.createFolder('/test/path');

      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/path');
      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle errors when creating folder', () => {
      mockFs.existsSync.mockReturnValue(false);
      const error = new Error('Permission denied');
      mockFs.mkdirSync.mockImplementation(() => {
        throw error;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      folderUtil.createFolder('/test/path');

      expect(mockFs.existsSync).toHaveBeenCalledWith('/test/path');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/test/path', { recursive: true });
      expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao criar a pasta '/test/path':", error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('writeFile', () => {
    it('should write file with Buffer data successfully', () => {
      mockFs.writeFileSync.mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const testBuffer = Buffer.from('test buffer content');

      folderUtil.writeFile('/test/file.txt', testBuffer);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith('/test/file.txt', testBuffer);
      expect(consoleSpy).toHaveBeenCalledWith("Arquivo salvo em '/test/file.txt' com sucesso.");

      consoleSpy.mockRestore();
    });

    it('should write file with string data successfully', () => {
      mockFs.writeFileSync.mockImplementation(() => {});
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      folderUtil.writeFile('/test/file.txt', 'test string content');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith('/test/file.txt', 'test string content');
      expect(consoleSpy).toHaveBeenCalledWith("Arquivo salvo em '/test/file.txt' com sucesso.");

      consoleSpy.mockRestore();
    });

    it('should handle errors when writing file', () => {
      const error = new Error('Disk full');
      mockFs.writeFileSync.mockImplementation(() => {
        throw error;
      });
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      folderUtil.writeFile('/test/file.txt', 'test content');

      expect(mockFs.writeFileSync).toHaveBeenCalledWith('/test/file.txt', 'test content');
      expect(consoleErrorSpy).toHaveBeenCalledWith("Erro ao salvar o arquivo em '/test/file.txt':", error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getFileExtension', () => {
    it('should return file extension without dot for video file', () => {
      const result = folderUtil.getFileExtension('video.mp4');
      expect(result).toBe('mp4');
    });

    it('should return file extension without dot for image file', () => {
      const result = folderUtil.getFileExtension('image.png');
      expect(result).toBe('png');
    });

    it('should return empty string for file without extension', () => {
      const result = folderUtil.getFileExtension('README');
      expect(result).toBe('');
    });

    it('should handle multiple dots in filename', () => {
      const result = folderUtil.getFileExtension('archive.tar.gz');
      expect(result).toBe('gz');
    });

    it('should handle filename with only extension', () => {
      const result = folderUtil.getFileExtension('.gitignore');
      expect(result).toBe('gitignore');
    });

    it('should handle empty filename', () => {
      const result = folderUtil.getFileExtension('');
      expect(result).toBe('');
    });

    it('should handle filename ending with dot', () => {
      const result = folderUtil.getFileExtension('filename.');
      expect(result).toBe('');
    });
  });

  describe('empDirNameGenerator', () => {
    it('should generate unique directory name using cuid', () => {
      const result = folderUtil.tempDirNameGenerator();
      expect(result).toBe('test-cuid-123');
    });

    it('should call cuid function', () => {
      const cuid = require('cuid');
      folderUtil.tempDirNameGenerator();
      expect(cuid).toHaveBeenCalled();
    });
  });

  describe('Integration tests', () => {
    it('should create folder, write file, and delete folder in sequence', () => {
      mockFs.existsSync.mockReturnValue(false);
      mockFs.mkdirSync.mockImplementation(() => '');
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.rmSync.mockImplementation(() => {});

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const testPath = '/test/integration';
      const testFile = '/test/integration/file.txt';

      // Create folder
      folderUtil.createFolder(testPath);
      expect(mockFs.mkdirSync).toHaveBeenCalledWith(testPath, { recursive: true });

      // Write file
      folderUtil.writeFile(testFile, 'integration test content');
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(testFile, 'integration test content');

      // Delete folder
      mockFs.existsSync.mockReturnValue(true);
      folderUtil.deleteFolder(testPath);
      expect(mockFs.rmSync).toHaveBeenCalledWith(testPath, { recursive: true, force: true });

      consoleSpy.mockRestore();
    });
  });
});