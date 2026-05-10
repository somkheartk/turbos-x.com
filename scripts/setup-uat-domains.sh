#!/usr/bin/env bash
# One-time setup: create Cloud Run domain mappings for UAT
# Run once after first UAT deploy: bash scripts/setup-uat-domains.sh
# Requires: gcloud auth login + domain turbos-x.com verified in GCP

set -e

PROJECT_ID="probable-effort-445713-t1"
REGION="asia-southeast1"

declare -A MAPPINGS=(
  ["pos-web-uat"]="uat.turbos-x.com"
  ["pos-service-uat"]="pos-api.uat.turbos-x.com"
  ["pos-sales-service-uat"]="pos-sales.uat.turbos-x.com"
  ["pos-catalog-service-uat"]="pos-catalog.uat.turbos-x.com"
)

echo "Creating UAT domain mappings..."
echo ""

for SERVICE in "${!MAPPINGS[@]}"; do
  DOMAIN="${MAPPINGS[$SERVICE]}"
  echo "▶ $SERVICE → $DOMAIN"

  gcloud run domain-mappings create \
    --service "$SERVICE" \
    --domain "$DOMAIN" \
    --region "$REGION" \
    --project "$PROJECT_ID" 2>/dev/null || echo "  (already exists)"
done

echo ""
echo "DNS records to add at your DNS provider:"
echo "─────────────────────────────────────────"

for SERVICE in "${!MAPPINGS[@]}"; do
  DOMAIN="${MAPPINGS[$SERVICE]}"
  echo ""
  echo "[$DOMAIN]"
  gcloud run domain-mappings describe \
    --domain "$DOMAIN" \
    --region "$REGION" \
    --project "$PROJECT_ID" \
    --format="table(status.resourceRecords[].name, status.resourceRecords[].type, status.resourceRecords[].rrdata)" 2>/dev/null || true
done
