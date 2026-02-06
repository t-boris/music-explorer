#!/usr/bin/env bash
set -euo pipefail

# Deploy to Firebase Hosting (builds Next.js + deploys Cloud Function).
# After deploy, re-inject server-side env vars that the Firebase adapter
# doesn't include in the Cloud Run service configuration.
#
# Usage:
#   ./scripts/deploy.sh                   # full deploy
#   ./scripts/deploy.sh --only hosting    # hosting only

REGION="us-central1"
PROJECT="music-explorer-app"
SERVICE="ssrmusicexplorerapp"

echo "==> Deploying to Firebase..."
npx firebase deploy "$@"

echo ""
echo "==> Injecting server-side env vars into Cloud Run service..."

# Read server-side vars from .env.local
PROJ_ID=$(grep '^FIREBASE_PROJECT_ID=' .env.local | cut -d= -f2-)
CLIENT_EMAIL=$(grep '^FIREBASE_CLIENT_EMAIL=' .env.local | cut -d= -f2-)
PRIVATE_KEY=$(grep '^FIREBASE_PRIVATE_KEY=' .env.local | cut -d= -f2- | sed 's/^"//' | sed 's/"$//')
COOKIE_NAME=$(grep '^AUTH_COOKIE_NAME=' .env.local | cut -d= -f2-)
SIG_KEYS=$(grep '^AUTH_COOKIE_SIGNATURE_KEYS=' .env.local | cut -d= -f2-)

# Use @@ as separator to avoid conflicts with commas in signature keys.
# --update-env-vars adds/updates without removing existing vars like __FIREBASE_DEFAULTS__.
gcloud run services update "$SERVICE" \
  --region "$REGION" \
  --project "$PROJECT" \
  --update-env-vars "^@@^FIREBASE_PROJECT_ID=${PROJ_ID}@@FIREBASE_CLIENT_EMAIL=${CLIENT_EMAIL}@@AUTH_COOKIE_NAME=${COOKIE_NAME}@@AUTH_COOKIE_SIGNATURE_KEYS=${SIG_KEYS}@@FIREBASE_PRIVATE_KEY=${PRIVATE_KEY}"

echo ""
echo "==> Deploy complete. Server-side env vars are set."
