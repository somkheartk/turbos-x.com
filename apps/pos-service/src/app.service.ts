import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'smartstore-api',
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
