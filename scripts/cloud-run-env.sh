#!/usr/bin/env bash
# Usage: ./scripts/cloud-run-env.sh <service-name>
# Outputs comma-separated KEY=VALUE for --set-env-vars
# Sensitive values (MONGODB_URI, KAFKA_BROKERS) should be stored in
# Secret Manager and referenced separately with --set-secrets.

SERVICE="$1"

case "$SERVICE" in
  pos-web)
    echo "API_BASE_URL=https://pos-service-<hash>-as.a.run.app/api,NODE_ENV=production"
    ;;
  pos-service)
    echo "PORT=3001,NODE_ENV=production,CATALOG_SERVICE_URL=https://pos-catalog-service-<hash>-as.a.run.app/api,SALES_SERVICE_URL=https://pos-sales-service-<hash>-as.a.run.app/api"
    ;;
  pos-sales-service)
    echo "PORT=3002,NODE_ENV=production"
    ;;
  pos-catalog-service)
    echo "PORT=3003,NODE_ENV=production"
    ;;
  *)
    echo "NODE_ENV=production"
    ;;
esac
