#!/usr/bin/env bash
# Usage: ./scripts/cloud-run-env-dev.sh <service-name>
# Dev environment — uses actual Cloud Run service URLs (direct, not custom domains)
# NOTE: PORT is reserved by Cloud Run — do not include it here.

SERVICE="$1"

SALES_URL="https://pos-sales-service-dev-g2q47ewoqa-as.a.run.app/api"
CATALOG_URL="https://pos-catalog-service-dev-g2q47ewoqa-as.a.run.app/api"
POS_URL="https://pos-service-dev-g2q47ewoqa-as.a.run.app/api"

case "$SERVICE" in
  pos-web)
    echo "API_BASE_URL=${POS_URL},NODE_ENV=development"
    ;;
  pos-service)
    echo "NODE_ENV=development,CATALOG_SERVICE_URL=${CATALOG_URL},SALES_SERVICE_URL=${SALES_URL}"
    ;;
  pos-sales-service)
    echo "NODE_ENV=development,KAFKA_BROKERS=pkc-ldvr1.asia-southeast1.gcp.confluent.cloud:9092,CATALOG_SERVICE_URL=${CATALOG_URL}"
    ;;
  pos-catalog-service)
    echo "NODE_ENV=development,KAFKA_BROKERS=pkc-ldvr1.asia-southeast1.gcp.confluent.cloud:9092"
    ;;
  *)
    echo "NODE_ENV=development"
    ;;
esac
