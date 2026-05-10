import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { PosController } from './pos.controller';
import { PosService } from './pos.service';

@Module({
  imports: [AdminModule],
  controllers: [PosController],
  providers: [PosService],
})
export class PosModule {}
