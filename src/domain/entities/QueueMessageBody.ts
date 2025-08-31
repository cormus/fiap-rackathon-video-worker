import { Status } from "../enumeration/Status";

export class QueueMessageBody{
  constructor(
    public videoPath: string,
    public status: Status,
    public outputName: string,
  ){}
}
