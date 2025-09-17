import { QueueMessageMovieBody } from "../entities/QueueMessageMovieBody";

export class VideoValidatorService{
    public validate(video: QueueMessageMovieBody): boolean {
        if(video.videoPath != null)
            return true;
        return false;
    }
}