# Task Plan: Microservice Architecture + Kafka
> Created by: Tech Lead
> Feature: แยก POS เป็น microservices + Kafka event streaming
> Date: 2026-05-09

## Summary
แยก monolith `apps/api` ออกเป็น 3 services ย่อย: **API Gateway**, **POS Service**, **Catalog Service**
เพิ่ม Kafka เป็น message broker สำหรับ event streaming ระหว่าง services
Dashboard ดึงข้อมูลจาก Kafka consumer แทน direct DB query

## Architecture

```
Browser (Next.js :3000)
    │ HTTP
    ▼
API Gateway (:3001)          ← apps/api  [refactored]
    │ HTTP proxy / Kafka RPC
    ├──► POS Service (:3002)   ← apps/pos-service  [NEW]
    │         │ publishes
    │         ▼
    │    Kafka Broker (:9092)
    │         │ subscribes
    └──► Catalog Service (:3003) ← apps/catalog-service  [NEW]
```

## Kafka Topics
| Topic | Producer | Consumer | Payload |
|---|---|---|---|
| `pos.transaction.created` | pos-service | api-gateway (analytics) | { transactionId, total, cashierName, items } |
| `pos.product.created` | catalog-service | api-gateway | { sku, name, category, price } |
| `pos.user.created` | pos-service | api-gateway | { id, name, role } |

## Scope
- Domain: infrastructure / all POS domains
- Affected roles: OWN, OPS, POS
- Complexity: High

## Tasks

### Infrastructure
- [ ] `docker-compose.yml` — Kafka + Zookeeper + MongoDB + 3 services
- [ ] `apps/pos-service/package.json` + `nest-cli.json` + `tsconfig.json`
- [ ] `apps/catalog-service/package.json` + `nest-cli.json` + `tsconfig.json`

### POS Service (`apps/pos-service` :3002)
- [ ] `src/main.ts` — HTTP server + Kafka microservice transport
- [ ] `src/app.module.ts` — MongoDB + Kafka producer setup
- [ ] `src/transactions/` — checkout, list transactions (move from apps/api/pos)
- [ ] `src/users/` — POS users CRUD (move from apps/api/pos)
- [ ] Publish `pos.transaction.created` event on checkout
- [ ] Publish `pos.user.created` event on createUser

### Catalog Service (`apps/catalog-service` :3003)
- [ ] `src/main.ts` — HTTP server + Kafka transport
- [ ] `src/app.module.ts` — MongoDB setup
- [ ] `src/products/` — product list + create (move from apps/api/pos + admin)
- [ ] Publish `pos.product.created` event on createProduct

### API Gateway (`apps/api` refactored)
- [ ] `src/gateway/` — HTTP proxy to pos-service & catalog-service
- [ ] Kafka consumer: subscribe `pos.transaction.created` → update in-memory analytics
- [ ] `GET /pos/dashboard` — served from Kafka-aggregated data
- [ ] `GET /pos/products` — proxy to catalog-service
- [ ] `POST /pos/orders` — proxy to pos-service
- [ ] `GET /pos/users` — proxy to pos-service
- [ ] ลบ pos module เดิมออก (แทนด้วย gateway)

### Kafka Shared Types (`packages/kafka-events`)
- [ ] `src/events.ts` — TypeScript interfaces ของทุก Kafka event
  ```ts
  export interface TransactionCreatedEvent {
    eventType: 'transaction.created';
    transactionId: string;
    total: number;
    cashierName: string;
    items: number;
    createdAt: string;
  }
  ```

## API Contract (unchanged — frontend ไม่ต้องแก้)
Frontend ยังคง call `API Gateway :3001` เหมือนเดิม:
- `GET /api/pos/dashboard`
- `GET /api/pos/products`
- `POST /api/pos/products`
- `GET /api/pos/orders`
- `POST /api/pos/orders`
- `GET /api/pos/users`
- `POST /api/pos/users`
- `PATCH /api/pos/users/:id`

## Acceptance Criteria
- [ ] `docker-compose up` ทำให้ทุก service ขึ้นพร้อมกัน
- [ ] checkout จาก Cashier terminal → event ปรากฏใน Kafka topic `pos.transaction.created`
- [ ] Dashboard แสดง stats จาก Kafka consumer (real-time)
- [ ] แต่ละ service มี health check endpoint `GET /health`
- [ ] Frontend ยังทำงานได้โดยไม่ต้องแก้ code
