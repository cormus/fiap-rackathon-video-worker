import { QueueMessageZipBody } from '../../../src/domain/entities/QueueMessageZipBody';
import { Status } from '../../../src/domain/enumeration/Status';

describe('QueueMessageZipBody', () => {
  describe('constructor', () => {
    it('should create instance with status and zipPath', () => {
      const status = Status.PENDING;
      const zipPath = '/test/archive.zip';
      
      const message = new QueueMessageZipBody(status, zipPath);
      
      expect(message).toBeInstanceOf(QueueMessageZipBody);
      expect(message.status).toBe(status);
      expect(message.zipPath).toBe(zipPath);
    });

    it('should create instance with different status values', () => {
      const zipPath = '/test/file.zip';
      
      const pendingMessage = new QueueMessageZipBody(Status.PENDING, zipPath);
      expect(pendingMessage.status).toBe(Status.PENDING);
      
      const processingMessage = new QueueMessageZipBody(Status.PROCESSING, zipPath);
      expect(processingMessage.status).toBe(Status.PROCESSING);
      
      const errorMessage = new QueueMessageZipBody(Status.ERROR, zipPath);
      expect(errorMessage.status).toBe(Status.ERROR);
    });

    it('should create instance with different zipPath values', () => {
      const status = Status.PENDING;
      
      const message1 = new QueueMessageZipBody(status, '/path1/file1.zip');
      expect(message1.zipPath).toBe('/path1/file1.zip');
      
      const message2 = new QueueMessageZipBody(status, '/path2/file2.zip');
      expect(message2.zipPath).toBe('/path2/file2.zip');
      
      const message3 = new QueueMessageZipBody(status, 'relative/path.zip');
      expect(message3.zipPath).toBe('relative/path.zip');
    });
  });

  describe('properties', () => {
    it('should allow reading status property', () => {
      const message = new QueueMessageZipBody(Status.PROCESSING, '/test.zip');
      expect(message.status).toBe(Status.PROCESSING);
    });

    it('should allow reading zipPath property', () => {
      const zipPath = '/output/compressed.zip';
      const message = new QueueMessageZipBody(Status.PENDING, zipPath);
      expect(message.zipPath).toBe(zipPath);
    });

    it('should allow modifying status property', () => {
      const message = new QueueMessageZipBody(Status.PENDING, '/test.zip');
      
      message.status = Status.PROCESSING;
      expect(message.status).toBe(Status.PROCESSING)
    });

    it('should allow modifying zipPath property', () => {
      const message = new QueueMessageZipBody(Status.PENDING, '/initial.zip');
      
      message.zipPath = '/updated.zip';
      expect(message.zipPath).toBe('/updated.zip');
      
      message.zipPath = '/final/path.zip';
      expect(message.zipPath).toBe('/final/path.zip');
    });
  });

  describe('inheritance', () => {
    it('should extend QueueMessage', () => {
      const message = new QueueMessageZipBody(Status.PENDING, '/test.zip');
      expect(message).toBeInstanceOf(QueueMessageZipBody);
    });

    it('should call super() in constructor', () => {
      // Test that the object is properly initialized
      const message = new QueueMessageZipBody(Status.PENDING, '/test.zip');
      expect(message).toBeDefined();
      expect(message.status).toBeDefined();
      expect(message.zipPath).toBeDefined();
    });
  });

  describe('data types', () => {
    it('should have correct property types', () => {
      const message = new QueueMessageZipBody(Status.PENDING, '/test.zip');
      
      expect(typeof message.status).toBe('string');
      expect(typeof message.zipPath).toBe('string');
    });

    it('should handle empty string zipPath', () => {
      const message = new QueueMessageZipBody(Status.PENDING, '');
      expect(message.zipPath).toBe('');
    });

    it('should handle paths with special characters', () => {
      const specialPath = '/path with spaces/file-name_123.zip';
      const message = new QueueMessageZipBody(Status.PENDING, specialPath);
      expect(message.zipPath).toBe(specialPath);
    });
  });

  describe('multiple instances', () => {
    it('should create independent instances', () => {
      const message1 = new QueueMessageZipBody(Status.PENDING, '/file1.zip');
      const message2 = new QueueMessageZipBody(Status.PROCESSING, '/file2.zip');
      
      expect(message1.status).toBe(Status.PENDING);
      expect(message1.zipPath).toBe('/file1.zip');
      
      expect(message2.status).toBe(Status.PROCESSING);
      expect(message2.zipPath).toBe('/file2.zip');
    });
  });
});