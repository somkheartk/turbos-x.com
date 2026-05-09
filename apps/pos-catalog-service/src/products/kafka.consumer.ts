import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka, SASLOptions } from 'kafkajs';
import { ProductsService } from './products.service';

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
export class KafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumer.name);
  private readonly consumer: Consumer;

  constructor(private readonly productsService: ProductsService) {
    this.consumer = buildKafkaClient('catalog-service-consumer').consumer({ groupId: 'catalog-service' });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.consumer.connect();
      const topic = process.env.KAFKA_TOPIC_TRANSACTION_CREATED ?? 'pos.transaction.created';
      await this.consumer.subscribe({ topic, fromBeginning: false });
      void this.consumer.run({
        eachMessage: async ({ message }) => {
          if (!message.value) return;
          try {
            const payload = JSON.parse(message.value.toString()) as {
              items?: Array<{ productSku: string; qty: number }>;
            };
            if (Array.isArray(payload.items) && payload.items.length > 0) {
              await this.productsService.decrementStock(payload.items);
            }
          } catch (err) {
            this.logger.warn(`Failed to process transaction event: ${(err as Error).message}`);
          }
        },
      });
      this.logger.log('Kafka consumer connected — subscribed to pos.transaction.created');
    } catch (err) {
      this.logger.warn(`Kafka consumer unavailable — stock sync will be skipped: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.consumer.disconnect();
    } catch {}
  }
}
