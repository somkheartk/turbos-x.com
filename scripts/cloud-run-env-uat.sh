#!/usr/bin/env bash
# Usage: ./scripts/cloud-run-env-uat.sh <service-name>
# UAT environment — uses Cloud Run service URLs for *-uat services
# NOTE: PORT is reserved by Cloud Run — do not include it here.

SERVICE="$1"

SALES_URL="https://pos-sales-service-uat-g2q47ewoqa-as.a.run.app/api"
CATALOG_URL="https://pos-catalog-service-uat-g2q47ewoqa-as.a.run.app/api"
POS_URL="https://pos-service-uat-g2q47ewoqa-as.a.run.app/api"

case "$SERVICE" in
  pos-web)
    echo "API_BASE_URL=${POS_URL},NODE_ENV=uat"
    ;;
  pos-service)
    echo "NODE_ENV=uat,CORS_ORIGIN=*,CATALOG_SERVICE_URL=${CATALOG_URL},SALES_SERVICE_URL=${SALES_URL}"
    ;;
  pos-sales-service)
    echo "NODE_ENV=uat,KAFKA_BROKERS=pkc-ldvr1.asia-southeast1.gcp.confluent.cloud:9092"
    ;;
  pos-catalog-service)
    echo "NODE_ENV=uat,KAFKA_BROKERS=pkc-ldvr1.asia-southeast1.gcp.confluent.cloud:9092"
    ;;
  *)
    echo "NODE_ENV=uat"
    ;;
esac
