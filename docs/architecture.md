# Smartstore — System Architecture

```mermaid
flowchart TD
    Browser(["🌐 Browser / POS Terminal"])

    subgraph frontend["Frontend — pos-web :3000"]
        Web["Next.js 15 · App Router\n/pos/dashboard · /pos/cashier\n/pos/products · /pos/orders\n/pos/users · /pos/reports"]
        Proxy["Next.js API Proxy\n/api/pos/[...path]\n/api/admin/[...path]"]
    end

    subgraph gateway["API Gateway — pos-service :3001"]
        PosCtrl["POS Controller\nGET  /api/pos/dashboard\nGET  /api/pos/products\nPOST /api/pos/products\nGET  /api/pos/orders\nPOST /api/pos/orders\nGET  /api/pos/users\nPOST /api/pos/users\nPATCH /api/pos/users/:id\nGET  /api/pos/reports"]
        AdminCtrl["Admin Controller\nGET /api/admin/overview\nGET /api/admin/reports\nGET /api/admin/stock\n..."]
        SwaggerUI["Swagger UI\n/api/docs"]
    end

    subgraph services["Downstream Services"]
        SalesService["**pos-sales-service** :3002\nGET  /api/pos/orders\nGET  /api/pos/orders/today\nPOST /api/pos/orders\nGET  /api/pos/users\nPOST /api/pos/users\nPATCH /api/pos/users/:id"]
        CatalogService["**pos-catalog-service** :3003\nGET  /api/pos/products\nPOST /api/pos/products"]
    end

    subgraph infra["Infrastructure"]
        MongoPOS[("MongoDB\npos_service db")]
        MongoSales[("MongoDB\npos_sales db")]
        MongoCatalog[("MongoDB\npos_catalog db")]
        Kafka{{"Kafka :9092"}}
        KafkaUI["kafka-ui :8080"]
    end

    Browser -->|"HTTP :3000"| Web
    Web --> Proxy
    Proxy -->|"REST"| PosCtrl
    Proxy -->|"REST"| AdminCtrl

    PosCtrl -->|"aggregates"| SalesService
    PosCtrl -->|"aggregates"| CatalogService
    AdminCtrl -->|"reads transactions"| SalesService

    PosCtrl -.->|"internal"| AdminCtrl

    SalesService   -->|"R/W"| MongoSales
    CatalogService -->|"R/W"| MongoCatalog
    PosCtrl        -->|"R/W"| MongoPOS
    AdminCtrl      -->|"R/W"| MongoPOS

    SalesService   -->|"pos.transaction.created\npos.user.created"| Kafka
    CatalogService -->|"pos.product.created"| Kafka
    KafkaUI -.->|"monitor"| Kafka

    style Browser fill:#e0f2fe,stroke:#0284c7
    style Web fill:#dbeafe,stroke:#3b82f6
    style Proxy fill:#dbeafe,stroke:#3b82f6
    style PosCtrl fill:#ede9fe,stroke:#7c3aed
    style AdminCtrl fill:#ede9fe,stroke:#7c3aed
    style SwaggerUI fill:#dcfce7,stroke:#16a34a
    style SalesService fill:#ede9fe,stroke:#7c3aed
    style CatalogService fill:#ede9fe,stroke:#7c3aed
    style MongoPOS fill:#fef9c3,stroke:#ca8a04
    style MongoSales fill:#fef9c3,stroke:#ca8a04
    style MongoCatalog fill:#fef9c3,stroke:#ca8a04
    style Kafka fill:#fee2e2,stroke:#dc2626
    style KafkaUI fill:#f3f4f6,stroke:#9ca3af
```

## Packages

| Package | Port | Technology | Docs |
| ------- | ---- | ---------- | ---- |
| `@pos/pos-web` | 3000 | Next.js 15 · App Router | — |
| `@pos/pos-service` | 3001 | NestJS | [Swagger UI](http://localhost:3001/api/docs) |
| `@pos/pos-sales-service` | 3002 | NestJS | — |
| `@pos/pos-catalog-service` | 3003 | NestJS | — |
| MongoDB | 27017 | MongoDB 7 | — |
| Kafka | 9092 | Confluent Kafka 7.6 | — |
| kafka-ui | 8080 | Provectus Kafka UI | [UI](http://localhost:8080) |
| Zookeeper | 2181 | Confluent Zookeeper | — |

## API Endpoints (pos-service)

All endpoints are prefixed `/api`. The Next.js frontend proxies browser calls through `/api/pos/*` and `/api/admin/*` to the pos-service.

### POS (`/api/pos`)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/pos/dashboard` | Today's KPIs and top cashiers |
| GET | `/pos/products` | All products with categories |
| POST | `/pos/products` | Create a new product in catalog |
| GET | `/pos/orders` | All POS transactions with summary |
| POST | `/pos/orders` | Checkout — create a transaction |
| GET | `/pos/users` | All POS users (cashiers / managers) |
| POST | `/pos/users` | Create a new POS user |
| PATCH | `/pos/users/:id` | Update user status, role, or shift |
| GET | `/pos/reports` | 7-day sales report |

### Admin (`/api/admin`)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/admin/overview` | Stock and sales overview |
| GET | `/admin/stock` | Stock levels with reorder alerts |
| GET | `/admin/purchase-orders` | Purchase order list |
| PATCH | `/admin/purchase-orders/:po/approve` | Approve a purchase order |
| GET | `/admin/orders` | Fulfillment order list |
| PATCH | `/admin/orders/:orderNumber/advance` | Advance order status |
| GET | `/admin/catalog` | Admin catalog view |
| GET | `/admin/reports` | Reports (same data as `/pos/reports`) |

## Kafka Topics

| Topic | Published by | Description |
| ----- | ------------ | ----------- |
| `pos.transaction.created` | pos-sales-service | New checkout completed |
| `pos.user.created` | pos-sales-service | New POS user added |
| `pos.product.created` | pos-catalog-service | New product added to catalog |

## Request Flow — Checkout

```text
Browser
  → POST /api/pos/orders        (Next.js proxy)
  → POST /api/pos/orders        (pos-service PosController)
  → POST /api/pos/orders        (pos-sales-service TransactionsController)
  → MongoDB (save transaction)
  → Kafka: pos.transaction.created
```

## Request Flow — Reports

```text
pos-web (server-side SSR)
  → GET /pos/reports            (pos-service PosController)
  → AdminService.getReports()
    ├── GET /api/pos/orders     (pos-sales-service — real transaction data)
    └── AdminRepository.getStockItems() (pos-service MongoDB)
```
