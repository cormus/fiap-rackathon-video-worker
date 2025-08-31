export class VideoFrame {
  constructor(
    public readonly timestamp: number,
    public readonly imagePath: string,
    public readonly jobId: string
  ) {}
}