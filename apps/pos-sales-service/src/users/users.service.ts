import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PosUser, PosUserDocument } from '../schemas/pos-user.schema';
import { KafkaProducer } from '../kafka/kafka.producer';
import { CreateUserDto, UpdateUserDto } from './users.dto';

const SEED_USERS = [
  { name: 'Mint', role: 'cashier' as const, pin: '1234', status: 'Active' as const, shift: '08:00-17:00' },
  { name: 'Beam', role: 'cashier' as const, pin: '2345', status: 'Active' as const, shift: '10:00-19:00' },
  { name: 'Nida', role: 'manager' as const, pin: '3456', status: 'Active' as const, shift: '12:00-21:00' },
  { name: 'Som', role: 'admin' as const, pin: '0000', status: 'Inactive' as const },
];

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(PosUser.name) private readonly userModel: Model<PosUserDocument>,
    private readonly kafkaProducer: KafkaProducer,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async seedIfEmpty(): Promise<void> {
    const count = await this.userModel.countDocuments();
    if (count === 0) {
      this.logger.log('Seeding initial POS users...');
      await Promise.all(SEED_USERS.map((u) => this.userModel.create(u)));
      this.logger.log('Seed complete');
    }
  }

  async findAll() {
    const users = await this.userModel.find().sort({ role: 1, name: 1 }).lean();
    return {
      users: users.map((u) => ({
        id: String(u._id),
        name: u.name,
        role: u.role,
        status: u.status,
        shift: u.shift,
      })),
    };
  }

  async create(dto: CreateUserDto) {
    const user = await this.userModel.create({ ...dto, status: 'Active' });

    await this.kafkaProducer.publish(process.env.KAFKA_TOPIC_USER_CREATED ?? 'pos.user.created', {
      id: String(user._id),
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.get('createdAt') ?? new Date(),
    });

    return { message: `เพิ่ม ${dto.name} สำเร็จ`, user: { id: String(user._id), name: user.name, role: user.role, status: user.status, shift: user.shift } };
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean();

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return {
      message: 'อัปเดตสำเร็จ',
      user: { id: String(user._id), name: user.name, role: user.role, status: user.status, shift: user.shift },
    };
  }
}
