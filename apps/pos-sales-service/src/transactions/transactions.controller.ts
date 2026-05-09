import { Body, Controller, Get, Post } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CheckoutDto } from './transactions.dto';

@Controller('pos')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'pos-service' };
  }

  @Get('orders')
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('orders/today')
  findToday() {
    return this.transactionsService.findToday();
  }

  @Post('orders')
  checkout(@Body() dto: CheckoutDto) {
    return this.transactionsService.checkout(dto);
  }
}
