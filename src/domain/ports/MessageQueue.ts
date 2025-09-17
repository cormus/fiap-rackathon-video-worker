import { QueueMessage } from "../entities/QueueMessage";

export interface MessageQueue {
  receiveMessages(): Promise<QueueMessage[]>;
  deleteMessage(id: string): Promise<boolean>;
  sendMessage(message: QueueMessage): Promise<QueueMessage | null>;
}