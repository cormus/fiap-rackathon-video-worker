import SQSClient from "./sqsClient";
import { MessageQueue } from '../domain/ports/MessageQueue';
import { SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { QueueMessage } from "../domain/entities/QueueMessage";

export class SQSMessageQueue implements MessageQueue {

  constructor(
    private client: typeof SQSClient,
    private queueUrl: string
  ) {
  }

  async receiveMessages(): Promise<QueueMessage[]> {
    const params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 1, // Número máximo de mensagens a receber
    };

    const data = await this.client.send(new ReceiveMessageCommand(params));
    
    if (!data.Messages) {
      return [];
    }

    return data.Messages.map(message => {
      const body = message.Body ? JSON.parse(message.Body) : {};
      if(body.videoPath){
        return {
          id: message.ReceiptHandle || '',
          videoPath: body.videoPath || '',
          status: body.status || 'PENDING'
        } as QueueMessage;
      } else{
        return {
          id: message.ReceiptHandle || '',
          zipPath: body.zipPath || '',
          status: body.status || 'PENDING'
        } as QueueMessage;
      }
    });
  }

  async deleteMessage(id: string): Promise<boolean> {
    try {
      const params = {
        QueueUrl: this.queueUrl,
        ReceiptHandle: id,
      };
  
      await this.client.send(new DeleteMessageCommand(params));
      return true;
    } catch (err) {
      console.error(err);
    }
    return false;
  }

  async sendMessage(messageBody: QueueMessage): Promise<boolean> {
    try {
      const params = {
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(messageBody),
      };
  
      await this.client.send(new SendMessageCommand(params));
      
      return true;
    } catch (err) {
      console.error(err);
    }
    return false;
  }
}
