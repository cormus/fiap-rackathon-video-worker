import { ProccessVideoImage } from '../../src/application/usercases/ProccessVideoImage';
import { QueueMessageMovieBody } from '../../src/domain/entities/QueueMessageMovieBody';
import { QueueMessageZipBody } from '../../src/domain/entities/QueueMessageZipBody';
import { Status } from '../../src/domain/enumeration/Status';
import { FolderManager } from '../../src/domain/ports/FolderManager';
import { Storage } from '../../src/domain/ports/Storage';
import { MessageQueue } from '../../src/domain/ports/MessageQueue';
import { VideoProcessor } from '../../src/domain/ports/VideoProcessor';
import { CompressorFile } from '../../src/domain/ports/CompressorFile';

describe('ProccessVideoImage', () => {
  let proccessVideoImage: ProccessVideoImage;
  let mockFolderManager: jest.Mocked<FolderManager>;
  let mockStorage: jest.Mocked<Storage>;
  let mockVideoQueue: jest.Mocked<MessageQueue>;
  let mockImageQueue: jest.Mocked<MessageQueue>;
  let mockVideoProcessor: jest.Mocked<VideoProcessor>;
  let mockCompressorFile: jest.Mocked<CompressorFile>;

  beforeEach(() => {
    mockFolderManager = {
      createFolder: jest.fn(),
      deleteFolder: jest.fn(),
      writeFile: jest.fn(),
      getFileExtension: jest.fn(),
      tempDirNameGenerator: jest.fn().mockReturnValue('test-temp-id')
    };

    mockStorage = {
      getFile: jest.fn(),
      uploadFile: jest.fn(),
      deleteFile: jest.fn(),
      streamToBuffer: jest.fn()
    };

    mockVideoQueue = {
      receiveMessages: jest.fn(),
      sendMessage: jest.fn(),
      deleteMessage: jest.fn()
    };

    mockImageQueue = {
      receiveMessages: jest.fn(),
      sendMessage: jest.fn(),
      deleteMessage: jest.fn()
    };

    mockVideoProcessor = {
      extractFrames: jest.fn()
    };

    mockCompressorFile = {
      createZip: jest.fn()
    };

    proccessVideoImage = new ProccessVideoImage(
      mockFolderManager,
      mockStorage,
      mockVideoQueue,
      mockImageQueue,
      mockVideoProcessor,
      mockCompressorFile
    );
  });

  describe('constructor', () => {
    it('should create instance with all dependencies', () => {
      expect(proccessVideoImage).toBeInstanceOf(ProccessVideoImage);
    });

    it('should initialize temporary paths correctly', () => {
      expect(mockFolderManager.tempDirNameGenerator).toHaveBeenCalled();
    });
  });

  describe('processVideo', () => {
    it('should call videoProcessor.extractFrames with correct parameters', async () => {
      const videoPath = '/test/video.mp4';
      const outputPath = '/test/output';
      const frameSize = 4;

      await proccessVideoImage.processVideo(videoPath, outputPath, frameSize);

      expect(mockVideoProcessor.extractFrames).toHaveBeenCalledWith(
        videoPath,
        outputPath,
        frameSize
      );
    });
  });

  describe('compressFrames', () => {
    it('should call compressor.createZip and return buffer', async () => {
      const outputDir = '/test/output';
      const mockBuffer = Buffer.from('test zip content');
      mockCompressorFile.createZip.mockResolvedValue(mockBuffer);

      const result = await proccessVideoImage.compressFrames(outputDir);

      expect(mockCompressorFile.createZip).toHaveBeenCalledWith(outputDir);
      expect(result).toBe(mockBuffer);
    });
  });

  describe('execute', () => {

    it('should skip messages that are not PENDING or ERROR', async () => {
      const mockMessage = {
        id: 'message-1',
        videoPath: 'videos/test.mp4',
        status: Status.PROCESSING,
        receiptHandle: 'receipt-1'
      };

      mockVideoQueue.receiveMessages.mockResolvedValue([mockMessage]);

      await proccessVideoImage.execute();

      expect(mockStorage.getFile).not.toHaveBeenCalled();
      expect(mockVideoProcessor.extractFrames).not.toHaveBeenCalled();
    });

    it('should handle errors and update message status', async () => {
      const mockMessage = {
        id: 'message-1',
        videoPath: 'videos/test.mp4',
        status: Status.PENDING,
        receiptHandle: 'receipt-1'
      } as QueueMessageMovieBody;

      mockVideoQueue.receiveMessages.mockResolvedValue([mockMessage]);
      mockStorage.getFile.mockRejectedValue(new Error('Storage error'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await proccessVideoImage.execute();

      expect(consoleSpy).toHaveBeenCalledWith('Erro ao processar o vídeo: ', expect.any(Error));
      expect(mockVideoQueue.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ status: Status.ERROR })
      );

      consoleSpy.mockRestore();
    });

    it('should handle empty message list', async () => {
      mockVideoQueue.receiveMessages.mockResolvedValue([]);

      await proccessVideoImage.execute();

      expect(mockStorage.getFile).not.toHaveBeenCalled();
      expect(mockVideoProcessor.extractFrames).not.toHaveBeenCalled();
    });

    
  });
});