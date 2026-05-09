#!/usr/bin/env bash
# Usage: ./scripts/cloud-run-secrets-dev.sh <service-name>
# Outputs comma-separated ENV=SECRET:VERSION for --set-secrets (dev)

SERVICE="$1"

case "$SERVICE" in
  pos-web)
    echo ""
    ;;
  pos-service)
    echo "MONGODB_URI_POS=MONGODB_URI_POS_DEV:latest"
    ;;
  pos-sales-service)
    echo "MONGODB_URI_SALES=MONGODB_URI_SALES_DEV:latest,KAFKA_USERNAME=KAFKA_USERNAME:latest,KAFKA_PASSWORD=KAFKA_PASSWORD:latest"
    ;;
  pos-catalog-service)
    echo "MONGODB_URI_CATALOG=MONGODB_URI_CATALOG_DEV:latest,KAFKA_USERNAME=KAFKA_USERNAME:latest,KAFKA_PASSWORD=KAFKA_PASSWORD:latest"
    ;;
  *)
    echo ""
    ;;
esac
