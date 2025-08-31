import { QueueMessage } from "../entities/QueueMessage";
import { QueueMessageBody } from "../entities/QueueMessageBody";

export interface MessageQueue {
  receiveMessages(): Promise<QueueMessage[]>;
  deleteMessage(message: QueueMessage): Promise<void>;
  sendMessage(message: QueueMessageBody): Promise<void>;
}