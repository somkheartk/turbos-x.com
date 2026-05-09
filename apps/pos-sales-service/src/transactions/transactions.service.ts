import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PosTransaction, PosTransactionDocument } from '../schemas/pos-transaction.schema';
import { KafkaProducer } from '../kafka/kafka.producer';
import { CheckoutDto } from './transactions.dto';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function toTransactionDto(t: any) {
  return {
    transactionId: t.transactionId,
    items: (t.items ?? []).map((i: any) => ({
      productSku: i.productSku,
      productName: i.productName,
      qty: i.qty,
      unitPrice: i.unitPrice,
      unitPriceLabel: formatCurrency(i.unitPrice),
      lineTotal: i.lineTotal,
      lineTotalLabel: formatCurrency(i.lineTotal),
    })),
    subtotal: t.subtotal,
    subtotalLabel: formatCurrency(t.subtotal),
    discount: t.discount,
    total: t.total,
    totalLabel: formatCurrency(t.total),
    paymentMethod: t.paymentMethod,
    cashReceived: t.cashReceived,
    changeAmount: t.changeAmount,
    changeAmountLabel: formatCurrency(t.changeAmount),
    cashierName: t.cashierName,
    status: t.status,
    createdAtLabel: formatDateLabel(new Date(t.createdAt ?? Date.now())),
  };
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(PosTransaction.name) private readonly txModel: Model<PosTransactionDocument>,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  async checkout(dto: CheckoutDto) {
    const subtotal = dto.items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const discount = dto.discount ?? 0;
    const total = subtotal - discount;
    const cashReceived = dto.cashReceived ?? 0;
    const changeAmount = dto.paymentMethod === 'Cash' ? Math.max(0, cashReceived - total) : 0;

    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replaceAll('-', '');
    const rand = Math.floor(Math.random() * 900 + 100);
    const transactionId = `TXN-${datePart}-${rand}`;

    const tx = await this.txModel.create({
      transactionId,
      items: dto.items.map((i) => ({
        productSku: i.productSku,
        productName: i.productName,
        qty: i.qty,
        unitPrice: i.unitPrice,
        lineTotal: i.unitPrice * i.qty,
      })),
      subtotal,
      discount,
      total,
      paymentMethod: dto.paymentMethod,
      cashReceived,
      changeAmount,
      cashierName: dto.cashierName,
      status: 'Completed',
    });

    await this.kafkaProducer.publish(process.env.KAFKA_TOPIC_TRANSACTION_CREATED ?? 'pos.transaction.created', {
      transactionId,
      total,
      cashierName: dto.cashierName,
      items: dto.items.map((i) => ({ productSku: i.productSku, qty: i.qty })),
      paymentMethod: dto.paymentMethod,
      createdAt: tx.get('createdAt') ?? date,
    });

    return {
      transaction: toTransactionDto(tx),
      message: `${transactionId} — ชำระเงินสำเร็จ`,
    };
  }

  async findAll() {
    const txs = await this.txModel.find().sort({ createdAt: -1 }).lean();
    const completed = txs.filter((t) => t.status === 'Completed');
    const totalRevenue = completed.reduce((s, t) => s + t.total, 0);

    return {
      summary: [
        { label: 'Completed', value: String(completed.length) },
        { label: 'Voided', value: String(txs.length - completed.length) },
        { label: 'Total revenue', value: formatCurrency(totalRevenue) },
      ],
      transactions: txs.map(toTransactionDto),
    };
  }

  async findToday() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const txs = await this.txModel
      .find({ status: 'Completed', createdAt: { $gte: startOfDay } })
      .sort({ createdAt: -1 })
      .lean();

    return { transactions: txs.map(toTransactionDto) };
  }
}
