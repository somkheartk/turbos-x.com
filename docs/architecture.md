# Smartstore — System Architecture

```mermaid
flowchart TD
    Browser(["🌐 Browser / POS Terminal"])

    subgraph frontend["Frontend"]
        Web["**pos-web** :3000\nNext.js 14 · App Router"]
    end

    subgraph services["Microservices"]
        direction LR
        PosService["**pos-service** :3001\nNestJS\n─────────────────\nGET  /api/pos/dashboard\nGET  /api/pos/products\nPOST /api/pos/products\nGET  /api/pos/orders\nPOST /api/pos/orders\nGET  /api/pos/users\nPOST /api/pos/users\nPATCH /api/pos/users/:id"]
        SalesService["**pos-sales-service** :3002\nNestJS\n─────────────────\nTransactions\nCashier users"]
        CatalogService["**pos-catalog-service** :3003\nNestJS\n─────────────────\nProduct catalog"]
    end

    subgraph infra["Infrastructure"]
        Mongo[("MongoDB :27017\nsmartstore db")]
        Kafka{{"Kafka :9092\n(internal :29092)"}}
        ZK["Zookeeper :2181"]
        KafkaUI["kafka-ui :8080"]
    end

    Browser -->|"HTTP :3000"| Web
    Web -->|"REST /api"| PosService

    PosService     -->|"R/W"| Mongo
    SalesService   -->|"R/W"| Mongo
    CatalogService -->|"R/W"| Mongo

    PosService     -->|"pos.transaction.created\npos.user.created\npos.product.created"| Kafka
    SalesService   -->|"pos.transaction.created\npos.user.created"| Kafka
    CatalogService -->|"pos.product.created"| Kafka

    Kafka --- ZK
    KafkaUI -.->|"monitor"| Kafka

    style Browser fill:#e0f2fe,stroke:#0284c7
    style Web fill:#dbeafe,stroke:#3b82f6
    style PosService fill:#ede9fe,stroke:#7c3aed
    style SalesService fill:#ede9fe,stroke:#7c3aed
    style CatalogService fill:#ede9fe,stroke:#7c3aed
    style Mongo fill:#fef9c3,stroke:#ca8a04
    style Kafka fill:#fee2e2,stroke:#dc2626
    style ZK fill:#f3f4f6,stroke:#9ca3af
    style KafkaUI fill:#f3f4f6,stroke:#9ca3af
```

## Packages

| Package | Port | Technology |
| ------- | ---- | ---------- |
| `@pos/pos-web` | 3000 | Next.js 14 |
| `@pos/pos-service` | 3001 | NestJS |
| `@pos/pos-sales-service` | 3002 | NestJS |
| `@pos/pos-catalog-service` | 3003 | NestJS |
| MongoDB | 27017 | MongoDB 7 |
| Kafka | 9092 | Confluent Kafka 7.6 |
| kafka-ui | 8080 | Provectus Kafka UI |
| Zookeeper | 2181 | Confluent Zookeeper |

## Kafka Topics

| Topic | Publishers |
| ----- | ---------- |
| `pos.transaction.created` | pos-service, pos-sales-service |
| `pos.user.created` | pos-service, pos-sales-service |
| `pos.product.created` | pos-service, pos-catalog-service |
