#!/usr/bin/env bash
# Usage: ./scripts/cloud-run-secrets.sh <service-name>
# Outputs comma-separated ENV=SECRET:VERSION for --set-secrets (prod)

SERVICE="$1"

case "$SERVICE" in
  pos-web)
    echo ""
    ;;
  pos-service)
    echo "MONGODB_URI_POS=MONGODB_URI_POS:latest"
    ;;
  pos-sales-service)
    echo "MONGODB_URI_SALES=MONGODB_URI_SALES:latest,KAFKA_USERNAME=KAFKA_USERNAME:latest,KAFKA_PASSWORD=KAFKA_PASSWORD:latest"
    ;;
  pos-catalog-service)
    echo "MONGODB_URI_CATALOG=MONGODB_URI_CATALOG:latest,KAFKA_USERNAME=KAFKA_USERNAME:latest,KAFKA_PASSWORD=KAFKA_PASSWORD:latest"
    ;;
  *)
    echo ""
    ;;
esac
