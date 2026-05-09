#!/usr/bin/env bash
# Usage: ./scripts/cloud-run-env.sh <service-name>
# Outputs comma-separated KEY=VALUE for --set-env-vars
# NOTE: PORT is reserved by Cloud Run — do not include it here.
# Sensitive values (MONGODB_URI, KAFKA_USERNAME, KAFKA_PASSWORD) are in Secret Manager.

SERVICE="$1"

case "$SERVICE" in
  pos-web)
    echo "API_BASE_URL=https://pos-service-<hash>-as.a.run.app/api,NODE_ENV=production"
    ;;
  pos-service)
    echo "NODE_ENV=production,CATALOG_SERVICE_URL=https://pos-catalog-service-<hash>-as.a.run.app/api,SALES_SERVICE_URL=https://pos-sales-service-<hash>-as.a.run.app/api"
    ;;
  pos-sales-service)
    echo "NODE_ENV=production,KAFKA_BROKERS=pkc-ldvr1.asia-southeast1.gcp.confluent.cloud:9092,CATALOG_SERVICE_URL=https://pos-catalog-service-<hash>-as.a.run.app/api"
    ;;
  pos-catalog-service)
    echo "NODE_ENV=production,KAFKA_BROKERS=pkc-ldvr1.asia-southeast1.gcp.confluent.cloud:9092"
    ;;
  *)
    echo "NODE_ENV=production"
    ;;
esac
