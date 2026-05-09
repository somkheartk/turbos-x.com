#!/usr/bin/env bash
# Usage: ./scripts/cloud-run-env-dev.sh <service-name>
# Dev environment — points to *-dev Cloud Run services
# NOTE: PORT is reserved by Cloud Run — do not include it here.

SERVICE="$1"

case "$SERVICE" in
  pos-web)
    echo "API_BASE_URL=https://pos-api.dev.turbos-x.com/api,NODE_ENV=development"
    ;;
  pos-service)
    echo "NODE_ENV=development,CATALOG_SERVICE_URL=https://pos-catalog.dev.turbos-x.com/api,SALES_SERVICE_URL=https://pos-sales.dev.turbos-x.com/api"
    ;;
  pos-sales-service)
    echo "NODE_ENV=development,KAFKA_BROKERS=pkc-ldvr1.asia-southeast1.gcp.confluent.cloud:9092,CATALOG_SERVICE_URL=https://pos-catalog.dev.turbos-x.com/api"
    ;;
  pos-catalog-service)
    echo "NODE_ENV=development,KAFKA_BROKERS=pkc-ldvr1.asia-southeast1.gcp.confluent.cloud:9092"
    ;;
  *)
    echo "NODE_ENV=development"
    ;;
esac
