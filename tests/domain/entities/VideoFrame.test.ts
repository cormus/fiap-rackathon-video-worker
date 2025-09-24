import { VideoFrame } from '../../../src/domain/entities/VideoFrame';

describe('VideoFrame', () => {
  describe('constructor', () => {
    it('should create instance with timestamp, imagePath and jobId', () => {
      const timestamp = 10.5;
      const imagePath = '/path/to/frame.jpg';
      const jobId = 'job-123';
      
      const frame = new VideoFrame(timestamp, imagePath, jobId);
      
      expect(frame).toBeInstanceOf(VideoFrame);
      expect(frame.timestamp).toBe(timestamp);
      expect(frame.imagePath).toBe(imagePath);
      expect(frame.jobId).toBe(jobId);
    });

  });
});