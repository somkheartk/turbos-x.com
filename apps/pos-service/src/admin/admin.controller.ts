import { Controller, Get, Param, Patch } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get('stock')
  getStock() {
    return this.adminService.getStock();
  }

  @Get('pos')
  getPos() {
    return this.adminService.getPos();
  }

  @Get('purchase-orders')
  getPurchaseOrders() {
    return this.adminService.getPurchaseOrders();
  }

  @Get('orders')
  getOrders() {
    return this.adminService.getOrders();
  }

  @Patch('orders/:orderNumber/advance')
  updateOrderStatus(@Param('orderNumber') orderNumber: string) {
    return this.adminService.updateOrderStatus(orderNumber);
  }

  @Get('catalog')
  getCatalog() {
    return this.adminService.getCatalog();
  }

  @Get('reports')
  getReports() {
    return this.adminService.getReports();
  }

  @Patch('purchase-orders/:po/approve')
  approvePurchaseOrder(@Param('po') purchaseOrderId: string) {
    return this.adminService.approvePurchaseOrder(purchaseOrderId);
  }
}
