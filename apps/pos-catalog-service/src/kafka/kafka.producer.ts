import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducer.name);
  private readonly producer: Producer;

  constructor() {
    const brokers = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
    const kafka = new Kafka({ clientId: 'catalog-service', brokers });
    this.producer = kafka.producer();
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
    } catch (err) {
      this.logger.warn(`Kafka producer failed to disconnect: ${(err as Error).message}`);
    }
  }

  async publish(topic: string, payload: Record<string, unknown>): Promise<void> {
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
