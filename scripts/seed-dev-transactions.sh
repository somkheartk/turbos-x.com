#!/usr/bin/env bash
# Seed test POS transactions into the dev environment
# Usage: ./scripts/seed-dev-transactions.sh [API_URL]
# Default: https://pos-service-dev-g2q47ewoqa-as.a.run.app/api

set -euo pipefail

API="${1:-https://pos-service-dev-g2q47ewoqa-as.a.run.app/api}"
ENDPOINT="$API/pos/orders"

CASHIERS=("สมชาย" "มาลี" "วิชัย" "นิด" "ปอ")
METHODS=("Cash" "QR" "Card")
PRODUCTS=(
  '{"productSku":"SKU-001","productName":"Hydra Serum 30ml","qty":1,"unitPrice":1290}'
  '{"productSku":"SKU-014","productName":"Sun Shield SPF50","qty":2,"unitPrice":890}'
  '{"productSku":"SKU-031","productName":"Night Repair Mask","qty":1,"unitPrice":1590}'
  '{"productSku":"SKU-105","productName":"Cloud Cleanser","qty":3,"unitPrice":790}'
  '{"productSku":"SKU-200","productName":"Vitamin C Booster","qty":1,"unitPrice":1690}'
  '{"productSku":"SKU-001","productName":"Hydra Serum 30ml","qty":2,"unitPrice":1290}'
  '{"productSku":"SKU-014","productName":"Sun Shield SPF50","qty":1,"unitPrice":890}'
)

echo "Seeding transactions to $ENDPOINT"
echo "---"

COUNT=0
ERRORS=0

for i in $(seq 1 40); do
  CASHIER="${CASHIERS[$((RANDOM % ${#CASHIERS[@]}))]}"
  METHOD="${METHODS[$((RANDOM % ${#METHODS[@]}))]}"
  P1="${PRODUCTS[$((RANDOM % ${#PRODUCTS[@]}))]}"
  P2="${PRODUCTS[$((RANDOM % ${#PRODUCTS[@]}))]}"

  PAYLOAD=$(cat <<JSON
{
  "items": [$P1, $P2],
  "discount": 0,
  "paymentMethod": "$METHOD",
  "cashReceived": 5000,
  "cashierName": "$CASHIER"
}
JSON
)

  HTTP=$(curl -s -o /tmp/seed_resp.json -w "%{http_code}" \
    -X POST "$ENDPOINT" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" \
    --max-time 15 2>/dev/null)

  if [ "$HTTP" = "201" ] || [ "$HTTP" = "200" ]; then
    TXN=$(python3 -c "import json; d=open('/tmp/seed_resp.json').read(); print(json.loads(d).get('transaction',{}).get('transactionId','?'))" 2>/dev/null || echo "?")
    echo "[$i/40] $TXN — $CASHIER / $METHOD"
    COUNT=$((COUNT + 1))
  else
    echo "[$i/40] ERROR $HTTP"
    ERRORS=$((ERRORS + 1))
  fi

  sleep 0.3
done

echo ""
echo "Done: $COUNT created, $ERRORS errors"
