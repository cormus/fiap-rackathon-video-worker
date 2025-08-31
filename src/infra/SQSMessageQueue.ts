import { SQS } from 'aws-sdk';
import { MessageQueue } from '../domain/ports/MessageQueue';
import { QueueMessage } from '../domain/entities/QueueMessage';
import { QueueMessageBody } from '../domain/entities/QueueMessageBody';

export class SQSMessageQueue implements MessageQueue {
  private sqs: SQS;

  constructor(
    private readonly queueUrl: string,
    region: string = 'us-east-1'
  ) {
    this.sqs = new SQS({ region });
  }

  async receiveMessages(): Promise<QueueMessage[]> {
    const params = {
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,
      VisibilityTimeoutSeconds: 300
    };

    const result = await this.sqs.receiveMessage(params).promise();
    
    if (!result.Messages) {
      return [];
    }

    return result.Messages.map(message => ({
      id: message.MessageId || '',
      body: message.Body || '',
      receiptHandle: message.ReceiptHandle || ''
    }));
  }

  async deleteMessage(message: QueueMessage): Promise<void> {
    const params = {
      QueueUrl: this.queueUrl,
      ReceiptHandle: message.receiptHandle
    };

    await this.sqs.deleteMessage(params).promise();
  }

  async sendMessage(messageBody: QueueMessageBody): Promise<void> {
    const params = {
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(messageBody)
    };

    await this.sqs.sendMessage(params).promise();
  }
}
