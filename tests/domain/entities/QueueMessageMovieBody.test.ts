import { QueueMessageMovieBody } from '../../../src/domain/entities/QueueMessageMovieBody';
import { Status } from '../../../src/domain/enumeration/Status';

describe('QueueMessageMovieBody', () => {
  let messageBody: QueueMessageMovieBody;

  beforeEach(() => {
    messageBody = new QueueMessageMovieBody("", "", Status.PENDING);
  });

  describe('property assignment', () => {
    it('should allow setting id property', () => {
      const testId = 'test-id-123';
      messageBody.id = testId;
      expect(messageBody.id).toBe(testId);
    });

    it('should allow setting videoPath property', () => {
      const testPath = '/path/to/video.mp4';
      messageBody.videoPath = testPath;
      expect(messageBody.videoPath).toBe(testPath);
    });

    it('should allow setting status property', () => {
      messageBody.status = Status.PENDING;
      expect(messageBody.status).toBe(Status.PENDING);
    });

    it('should allow setting all properties', () => {
      const testId = 'test-id-456';
      const testPath = '/another/path/video.avi';
      const testStatus = Status.PROCESSING;

      messageBody.id = testId;
      messageBody.videoPath = testPath;
      messageBody.status = testStatus;

      expect(messageBody.id).toBe(testId);
      expect(messageBody.videoPath).toBe(testPath);
      expect(messageBody.status).toBe(testStatus);
    });
  });

  describe('validation scenarios', () => {
    it('should handle empty string values', () => {
      messageBody.id = '';
      messageBody.videoPath = '';
      
      expect(messageBody.id).toBe('');
      expect(messageBody.videoPath).toBe('');
    });

    it('should handle long file paths', () => {
      const longPath = '/very/long/path/to/video/files/with/many/subdirectories/video.mp4';
      messageBody.videoPath = longPath;
      expect(messageBody.videoPath).toBe(longPath);
    });

    it('should handle different video file extensions', () => {
      const extensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv'];
      
      extensions.forEach(ext => {
        const videoPath = `/path/to/video${ext}`;
        messageBody.videoPath = videoPath;
        expect(messageBody.videoPath).toBe(videoPath);
      });
    });

    it('should handle all status types', () => {
      const statuses = [Status.PENDING, Status.PROCESSING, Status.ERROR];
      
      statuses.forEach(status => {
        messageBody.status = status;
        expect(messageBody.status).toBe(status);
      });
    });
  });

  describe('data integrity', () => {
    it('should maintain data after multiple assignments', () => {
      messageBody.id = 'first-id';
      messageBody.videoPath = '/first/path.mp4';
      messageBody.status = Status.PENDING;

      // Change values
      messageBody.id = 'second-id';
      messageBody.videoPath = '/second/path.avi';
      messageBody.status = Status.PROCESSING;

      expect(messageBody.id).toBe('second-id');
      expect(messageBody.videoPath).toBe('/second/path.avi');
      expect(messageBody.status).toBe(Status.PROCESSING);
    });

    it('should allow independent property updates', () => {
      messageBody.id = 'initial-id';
      messageBody.videoPath = '/initial/path.mp4';
      messageBody.status = Status.PENDING;

      // Update only one property
      messageBody.status = Status.PROCESSING;

      expect(messageBody.id).toBe('initial-id');
      expect(messageBody.videoPath).toBe('/initial/path.mp4');
      expect(messageBody.status).toBe(Status.PROCESSING);
    });
  });

  describe('serialization', () => {
    it('should be serializable to JSON', () => {
      messageBody.id = 'json-test-id';
      messageBody.videoPath = '/json/test/path.mp4';
      messageBody.status = Status.PENDING;

      const json = JSON.stringify(messageBody);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe('json-test-id');
      expect(parsed.videoPath).toBe('/json/test/path.mp4');
      expect(parsed.status).toBe(Status.PENDING);
    });

    it('should recreate object from JSON', () => {
      const originalData = {
        id: 'recreate-test-id',
        videoPath: '/recreate/test/path.mp4',
        status: Status.PROCESSING
      };

      const newMessageBody = new QueueMessageMovieBody('', '', Status.PENDING);
      Object.assign(newMessageBody, originalData);

      expect(newMessageBody.id).toBe(originalData.id);
      expect(newMessageBody.videoPath).toBe(originalData.videoPath);
      expect(newMessageBody.status).toBe(originalData.status);
    });
  });

  describe('edge cases', () => {
    it('should handle null values', () => {
      messageBody.id = null as any;
      messageBody.videoPath = null as any;
      messageBody.status = null as any;

      expect(messageBody.id).toBeNull();
      expect(messageBody.videoPath).toBeNull();
      expect(messageBody.status).toBeNull();
    });

    it('should handle special characters in paths', () => {
      const specialPath = '/path/with spaces/special-chars_123/file (1).mp4';
      messageBody.videoPath = specialPath;
      expect(messageBody.videoPath).toBe(specialPath);
    });

    it('should handle Unicode characters', () => {
      const unicodePath = '/caminho/com/acentos/vídeo-téste.mp4';
      const unicodeId = 'id-com-acentuação-ção';
      
      messageBody.id = unicodeId;
      messageBody.videoPath = unicodePath;
      
      expect(messageBody.id).toBe(unicodeId);
      expect(messageBody.videoPath).toBe(unicodePath);
    });
  });
});