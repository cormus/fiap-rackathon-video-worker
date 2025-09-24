import { FolderManager } from '../../../src/domain/ports/FolderManager';

// Mock implementation for testing
class MockFolderManager implements FolderManager {
  deleteFolder(dirPath: string): void {
    console.log(`Mock: Deleting folder ${dirPath}`);
  }

  createFolder(dirPath: string): void {
    console.log(`Mock: Creating folder ${dirPath}`);
  }

  writeFile(dirPath: string, data: Buffer | string): void {
    console.log(`Mock: Writing file to ${dirPath}`);
  }

  getFileExtension(fileName: string): string {
    const ext = fileName.split('.').pop();
    return ext && fileName !== ext ? ext : '';
  }

  tempDirNameGenerator(): string {
    return 'mock-generated-id';
  }
}

describe('FolderManager Interface', () => {
  let mockFolderManager: MockFolderManager;

  beforeEach(() => {
    mockFolderManager = new MockFolderManager();
  });

  describe('interface compliance', () => {
    it('should implement deleteFolder method', () => {
      expect(typeof mockFolderManager.deleteFolder).toBe('function');
      expect(mockFolderManager.deleteFolder).toBeDefined();
    });

    it('should implement createFolder method', () => {
      expect(typeof mockFolderManager.createFolder).toBe('function');
      expect(mockFolderManager.createFolder).toBeDefined();
    });

    it('should implement writeFile method', () => {
      expect(typeof mockFolderManager.writeFile).toBe('function');
      expect(mockFolderManager.writeFile).toBeDefined();
    });

    it('should implement getFileExtension method', () => {
      expect(typeof mockFolderManager.getFileExtension).toBe('function');
      expect(mockFolderManager.getFileExtension).toBeDefined();
    });

    it('should implement tempDirNameGenerator method', () => {
      expect(typeof mockFolderManager.tempDirNameGenerator).toBe('function');
      expect(mockFolderManager.tempDirNameGenerator).toBeDefined();
    });
  });

  describe('method signatures', () => {
    it('should have correct deleteFolder signature', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      expect(() => mockFolderManager.deleteFolder('/test/path')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Mock: Deleting folder /test/path');
      
      consoleSpy.mockRestore();
    });

    it('should have correct createFolder signature', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      expect(() => mockFolderManager.createFolder('/test/path')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Mock: Creating folder /test/path');
      
      consoleSpy.mockRestore();
    });

    it('should have correct writeFile signature with string data', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      expect(() => mockFolderManager.writeFile('/test/file.txt', 'test data')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Mock: Writing file to /test/file.txt');
      
      consoleSpy.mockRestore();
    });

    it('should have correct writeFile signature with Buffer data', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const testBuffer = Buffer.from('test buffer data');
      
      expect(() => mockFolderManager.writeFile('/test/file.txt', testBuffer)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Mock: Writing file to /test/file.txt');
      
      consoleSpy.mockRestore();
    });

    it('should have correct getFileExtension signature and return type', () => {
      const result = mockFolderManager.getFileExtension('test.mp4');
      expect(typeof result).toBe('string');
      expect(result).toBe('mp4');
    });

    it('should have correct empDirNameGenerator signature and return type', () => {
      const result = mockFolderManager.tempDirNameGenerator();
      expect(typeof result).toBe('string');
      expect(result).toBe('mock-generated-id');
    });
  });

  describe('interface contract behavior', () => {
    it('should handle getFileExtension with various file types', () => {
      const testCases = [
        { input: 'video.mp4', expected: 'mp4' },
        { input: 'image.png', expected: 'png' },
        { input: 'document.pdf', expected: 'pdf' },
        { input: 'archive.tar.gz', expected: 'gz' },
        { input: 'README', expected: '' },
        { input: '', expected: '' },
        { input: '.gitignore', expected: 'gitignore' },
        { input: 'file.', expected: '' }
      ];

      testCases.forEach(testCase => {
        const result = mockFolderManager.getFileExtension(testCase.input);
        expect(result).toBe(testCase.expected);
      });
    });

    it('should generate directory names consistently', () => {
      const result1 = mockFolderManager.tempDirNameGenerator();
      const result2 = mockFolderManager.tempDirNameGenerator();
      
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
      expect(result1).toBe('mock-generated-id');
      expect(result2).toBe('mock-generated-id');
    });
  });

  describe('polymorphism', () => {
    it('should be assignable to FolderManager interface', () => {
      const folderManager: FolderManager = mockFolderManager;
      
      expect(folderManager).toBeDefined();
      expect(folderManager.deleteFolder).toBeDefined();
      expect(folderManager.createFolder).toBeDefined();
      expect(folderManager.writeFile).toBeDefined();
      expect(folderManager.getFileExtension).toBeDefined();
      expect(folderManager.tempDirNameGenerator).toBeDefined();
    });

    it('should work through interface reference', () => {
      const folderManager: FolderManager = mockFolderManager;
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      folderManager.createFolder('/test/interface/path');
      folderManager.deleteFolder('/test/interface/path');
      folderManager.writeFile('/test/file.txt', 'interface test');
      
      const extension = folderManager.getFileExtension('test.txt');
      const dirName = folderManager.tempDirNameGenerator();
      
      expect(extension).toBe('txt');
      expect(dirName).toBe('mock-generated-id');
      expect(consoleSpy).toHaveBeenCalledTimes(3);
      
      consoleSpy.mockRestore();
    });
  });
});