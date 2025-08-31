
export class QueueMessage {
  constructor(
    public id: string,
    public body: string,
    public receiptHandle: string,
  ){}
}
