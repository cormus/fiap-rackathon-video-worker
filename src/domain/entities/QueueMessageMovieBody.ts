import { Status } from "../enumeration/Status";
import { QueueMessage } from "./QueueMessage";

export class QueueMessageMovieBody extends QueueMessage {
  constructor(
    public id: string,
    public videoPath: string,
    public status: Status
  ){
    super();
  }
}