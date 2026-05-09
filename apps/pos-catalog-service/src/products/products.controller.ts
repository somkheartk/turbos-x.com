import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './products.dto';

@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('pos/products')
  async findAll() {
    return this.productsService.findAll();
  }

  @Post('pos/products')
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Get('catalog/health')
  health() {
    return { status: 'ok', service: 'catalog-service' };
  }
}
