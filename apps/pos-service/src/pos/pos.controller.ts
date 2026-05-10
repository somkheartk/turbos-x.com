import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckoutDto, CreatePosProductDto, CreatePosUserDto, UpdatePosUserDto } from './pos.dto';
import { PosService } from './pos.service';

@ApiTags('pos')
@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @ApiOperation({ summary: 'Today KPIs and top cashiers' })
  @Get('dashboard')
  getDashboard() {
    return this.posService.getDashboard();
  }

  @ApiOperation({ summary: 'List all products with categories' })
  @Get('products')
  getProducts() {
    return this.posService.getProducts();
  }

  @ApiOperation({ summary: 'Create a new product in the catalog' })
  @Post('products')
  createProduct(@Body() dto: CreatePosProductDto) {
    return this.posService.createProduct(dto);
  }

  @ApiOperation({ summary: 'List all POS transactions' })
  @Get('orders')
  getOrders() {
    return this.posService.getOrders();
  }

  @ApiOperation({ summary: 'Process a checkout and create a transaction' })
  @Post('orders')
  checkout(@Body() dto: CheckoutDto) {
    return this.posService.checkout(dto);
  }

  @ApiOperation({ summary: 'List all POS users (cashiers / managers)' })
  @Get('users')
  getUsers() {
    return this.posService.getUsers();
  }

  @ApiOperation({ summary: 'Create a new POS user' })
  @Post('users')
  createUser(@Body() dto: CreatePosUserDto) {
    return this.posService.createUser(dto);
  }

  @ApiOperation({ summary: 'Update user status, role, or shift' })
  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdatePosUserDto) {
    return this.posService.updateUser(id, dto);
  }

  @ApiOperation({ summary: '7-day sales report: daily trend, top products, by cashier, by shift' })
  @Get('reports')
  getReports() {
    return this.posService.getReports();
  }
}
