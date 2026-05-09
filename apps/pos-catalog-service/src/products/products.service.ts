import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatalogProduct, CatalogProductDocument } from '../schemas/catalog-product.schema';
import { KafkaProducer } from '../kafka/kafka.producer';
import { CreateProductDto } from './products.dto';

const thbFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 0,
});

const SEED_PRODUCTS = [
  { sku: 'BEV-001', name: 'กาแฟดำ', category: 'เครื่องดื่ม', price: 45, stockOnHand: 100 },
  { sku: 'BEV-002', name: 'ชาเขียว', category: 'เครื่องดื่ม', price: 50, stockOnHand: 80 },
  { sku: 'BEV-003', name: 'น้ำดื่ม 600ml', category: 'เครื่องดื่ม', price: 15, stockOnHand: 200 },
  { sku: 'SNK-001', name: 'ขนมปังกรอบ', category: 'ขนม', price: 35, stockOnHand: 150 },
  { sku: 'SNK-002', name: 'ช็อกโกแลต', category: 'ขนม', price: 40, stockOnHand: 120 },
  { sku: 'SNK-003', name: 'โยเกิร์ต', category: 'ขนม', price: 55, stockOnHand: 60 },
  { sku: 'FRS-001', name: 'ส้ม 1 กก.', category: 'ของสด', price: 80, stockOnHand: 50 },
  { sku: 'FRS-002', name: 'มะม่วง', category: 'ของสด', price: 90, stockOnHand: 40 },
];

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(CatalogProduct.name)
    private readonly productModel: Model<CatalogProductDocument>,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async findAll(): Promise<{ products: (CatalogProductDocument & { priceLabel: string })[]; categories: string[] }> {
    const rawProducts = await this.productModel.find().sort({ category: 1, name: 1 }).lean();

    const products = rawProducts.map((p) => ({
      ...p,
      priceLabel: thbFormatter.format(p.price),
    })) as unknown as (CatalogProductDocument & { priceLabel: string })[];

    const categories = [...new Set(rawProducts.map((p) => p.category))].sort();

    return { products, categories };
  }

  async create(dto: CreateProductDto): Promise<CatalogProductDocument> {
    const product = await this.productModel.create({
      ...dto,
      status: 'Active',
      channels: [],
    });

    await this.kafkaProducer.publish(process.env.KAFKA_TOPIC_PRODUCT_CREATED ?? 'pos.product.created', {
      sku: product.sku,
      name: product.name,
      category: product.category,
      price: product.price,
      createdAt: new Date().toISOString(),
    });

    return product;
  }

  async decrementStock(items: Array<{ productSku: string; qty: number }>): Promise<void> {
    await Promise.all(
      items.map((item) =>
        this.productModel.updateOne(
          { sku: item.productSku },
          { $inc: { stockOnHand: -item.qty } },
        ),
      ),
    );
  }

  async seedIfEmpty(): Promise<void> {
    const count = await this.productModel.countDocuments();
    if (count > 0) return;

    this.logger.log('Seeding catalog with sample products...');
    try {
      await this.productModel.insertMany(
        SEED_PRODUCTS.map((p) => ({
          ...p,
          status: 'Active',
          channels: [],
        })),
      );
      this.logger.log(`Seeded ${SEED_PRODUCTS.length} products`);
    } catch (err) {
      this.logger.warn(`Seed failed: ${(err as Error).message}`);
    }
  }
}
