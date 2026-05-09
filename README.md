# Smartstore POS — Turbos X

Monorepo microservice สำหรับระบบ POS ประกอบด้วย Next.js frontend และ NestJS backend services เชื่อมกันผ่าน Kafka

## โครงสร้าง

```
apps/
  pos-web/              Next.js 14 — cashier terminal frontend   :3000
  pos-service/          NestJS — main backend API                :3001
  pos-sales-service/    NestJS — sales & transaction domain      :3002
  pos-catalog-service/  NestJS — product catalog domain          :3003
docs/
  architecture.md       system diagram
```

## เริ่มต้น local

```bash
npm install
cp .env.example .env
npm run infra:up   # เปิด Kafka + MongoDB ผ่าน Docker
npm run dev        # รันทุก service พร้อมกัน
```

รันแยก service:

```bash
npm run dev:web       # pos-web      :3000
npm run dev:service   # pos-service  :3001
npm run dev:sales     # pos-sales-service  :3002
npm run dev:catalog   # pos-catalog-service  :3003
```

## Endpoints

| Service | URL |
| ------- | --- |
| Cashier terminal | http://localhost:3000 |
| pos-service API | http://localhost:3001/api |
| pos-sales-service | http://localhost:3002 |
| pos-catalog-service | http://localhost:3003 |
| Kafka UI | http://localhost:8080 |

