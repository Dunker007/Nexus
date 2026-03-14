#!/usr/bin/env bash
# Sets up Cloud Monitoring uptime check on /api/health
# Run once after initial Cloud Run deployment:
#   bash scripts/setup-monitoring.sh

set -e

PROJECT="${GOOGLE_CLOUD_PROJECT:-new-dlx}"
SERVICE_URL="${CLOUD_RUN_URL:-https://nexus-cloud-50841896985.us-central1.run.app}"
HEALTH_PATH="/api/health"

echo "Setting up Cloud Monitoring uptime check..."
echo "  Project: $PROJECT"
echo "  URL: $SERVICE_URL$HEALTH_PATH"

gcloud monitoring uptime create nexus-health \
  --project="$PROJECT" \
  --resource-type="uptime_url" \
  --hostname="${SERVICE_URL#https://}" \
  --path="$HEALTH_PATH" \
  --period=5 \
  --check-region="us-central1" \
  --check-region="us-east1" \
  2>/dev/null || echo "Uptime check may already exist — check Cloud Monitoring console."

echo "Done. View at: https://console.cloud.google.com/monitoring/uptime?project=$PROJECT"
