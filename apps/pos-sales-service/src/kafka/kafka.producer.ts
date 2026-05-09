import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer, SASLOptions } from 'kafkajs';

function buildKafkaClient(clientId: string): Kafka {
  const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
  const username = process.env.KAFKA_USERNAME;
  const password = process.env.KAFKA_PASSWORD;

  const sasl: SASLOptions | undefined =
    username && password
      ? { mechanism: 'plain', username, password }
      : undefined;

  return new Kafka({ clientId, brokers, ssl: !!sasl, sasl });
}

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducer.name);
  private readonly producer: Producer;

  constructor() {
    this.producer = buildKafkaClient('pos-sales-producer').producer();
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      this.logger.log('Kafka producer connected');
    } catch (err) {
      this.logger.warn(`Kafka producer failed to connect: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
    } catch {}
  }

  async publish(topic: string, payload: object): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(payload) }],
      });
    } catch (err) {
      this.logger.warn(`Failed to publish to topic "${topic}": ${(err as Error).message}`);
    }
  }
}
