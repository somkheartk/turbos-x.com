#!/usr/bin/env bash
# Usage: ./scripts/cloud-run-env-uat.sh <service-name>
# UAT environment — uses Cloud Run service URLs for *-uat services
# NOTE: PORT is reserved by Cloud Run — do not include it here.

SERVICE="$1"

# Custom domains for browser-facing URLs
POS_PUBLIC_URL="https://pos-api.uat.turbos-x.com/api"

# Direct Cloud Run URLs for server-to-server calls (avoids custom-domain SSL propagation delay)
POS_DIRECT_URL="https://pos-service-uat-g2q47ewoqa-as.a.run.app/api"
SALES_DIRECT_URL="https://pos-sales-service-uat-g2q47ewoqa-as.a.run.app/api"
CATALOG_DIRECT_URL="https://pos-catalog-service-uat-g2q47ewoqa-as.a.run.app/api"

case "$SERVICE" in
  pos-web)
    echo "API_BASE_URL=${POS_DIRECT_URL},NEXT_PUBLIC_API_BASE_URL=${POS_PUBLIC_URL},NODE_ENV=uat"
    ;;
  pos-service)
    echo "NODE_ENV=uat,CORS_ORIGIN=*,CATALOG_SERVICE_URL=${CATALOG_DIRECT_URL},SALES_SERVICE_URL=${SALES_DIRECT_URL}"
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
