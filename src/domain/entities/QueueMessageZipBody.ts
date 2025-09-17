import { Status } from "../enumeration/Status";
import { QueueMessage } from "./QueueMessage";

export class QueueMessageZipBody extends QueueMessage{
  constructor(
    public status: Status,
    public zipPath: string
  ){
    super();
  }
}
