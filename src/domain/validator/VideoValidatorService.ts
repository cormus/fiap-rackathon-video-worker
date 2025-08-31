import { QueueMessageBody } from "../entities/QueueMessageBody";

export class VideoValidatorService{
    public validate(video: QueueMessageBody): boolean {
        if(video.videoPath != null)
            return true;
        return false;
    }
}