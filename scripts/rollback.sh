#!/usr/bin/env bash
# Usage:
#   ./scripts/rollback.sh                        # interactive — pick from recent deploys
#   ./scripts/rollback.sh <sha> [service ...]    # rollback specific sha (all or named services)
#
# Examples:
#   ./scripts/rollback.sh
#   ./scripts/rollback.sh abc1234
#   ./scripts/rollback.sh abc1234 pos-web pos-service

set -euo pipefail

PROJECT_ID="probable-effort-445713-t1"
REGION="asia-southeast1"
REGISTRY="asia-southeast1-docker.pkg.dev/$PROJECT_ID/smartstore"
ALL_SERVICES=(pos-web pos-service pos-catalog-service pos-sales-service)

# ─── pick SHA ────────────────────────────────────────────────────────────────
if [[ -z "${1:-}" ]]; then
  echo "Recent commits on dev:"
  git log --oneline -10
  echo ""
  read -rp "Enter SHA to rollback to: " SHA
else
  SHA="$1"
  shift
fi

SHA=$(git rev-parse --short=40 "$SHA" 2>/dev/null || echo "$SHA")

# ─── pick services ───────────────────────────────────────────────────────────
if [[ $# -gt 0 ]]; then
  SERVICES=("$@")
else
  SERVICES=("${ALL_SERVICES[@]}")
fi

# ─── rollback ────────────────────────────────────────────────────────────────
echo ""
echo "Rolling back to image: $SHA"
echo "Services: ${SERVICES[*]}"
echo ""

for SERVICE in "${SERVICES[@]}"; do
  IMAGE="$REGISTRY/$SERVICE:$SHA"

  # verify image exists
  if ! gcloud artifacts docker images describe "$IMAGE" --project="$PROJECT_ID" &>/dev/null; then
    echo "✗ $SERVICE — image not found: $IMAGE (skipping)"
    continue
  fi

  ENV_VARS=$(bash "$(dirname "$0")/cloud-run-env.sh" "$SERVICE")
  SECRETS=$(bash "$(dirname "$0")/cloud-run-secrets.sh" "$SERVICE")

  echo "▶ Rolling back $SERVICE..."
  gcloud run deploy "$SERVICE" \
    --image "$IMAGE" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars "$ENV_VARS" \
    ${SECRETS:+--set-secrets="$SECRETS"} \
    --project "$PROJECT_ID"

  echo "✓ $SERVICE rolled back"
  echo ""
done

echo "Rollback complete. Remember to revert the commit in git to keep history clean:"
echo "  git revert <bad-commit> && git push origin dev"
