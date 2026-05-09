import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PosService } from './pos.service';
import { CheckoutDto, CreatePosProductDto, CreatePosUserDto, UpdatePosUserDto } from './pos.dto';

@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Get('dashboard')
  getDashboard() {
    return this.posService.getDashboard();
  }

  @Get('products')
  getProducts() {
    return this.posService.getProducts();
  }

  @Post('products')
  createProduct(@Body() dto: CreatePosProductDto) {
    return this.posService.createProduct(dto);
  }

  @Get('orders')
  getOrders() {
    return this.posService.getOrders();
  }

  @Post('orders')
  checkout(@Body() dto: CheckoutDto) {
    return this.posService.checkout(dto);
  }

  @Get('users')
  getUsers() {
    return this.posService.getUsers();
  }

  @Post('users')
  createUser(@Body() dto: CreatePosUserDto) {
    return this.posService.createUser(dto);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdatePosUserDto) {
    return this.posService.updateUser(id, dto);
  }
}
