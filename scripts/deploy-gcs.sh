#!/usr/bin/env bash
set -euo pipefail

# ── Grammar Quiz → GCS Deploy Script ──────────────────────
# Usage: ./scripts/deploy-gcs.sh
#
# Builds the project and syncs dist/ to a GCS bucket.
# Set GCS_BUCKET env var or edit the default below.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Configuration
GCS_BUCKET="${GCS_BUCKET:-gs://your-grammar-quiz-bucket}"

echo "=== Grammar Quiz Deploy ==="
echo "Bucket: $GCS_BUCKET"
echo ""

# Step 1: Build
echo "→ Building..."
cd "$PROJECT_ROOT"
npm run build

# Step 2: Sync to GCS
echo ""
echo "→ Syncing dist/ to $GCS_BUCKET..."

if [ -z "$CI" ]; then
    # Local: may need interactive auth
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1 | grep -q "@"; then
        echo "  No active gcloud account. Running gcloud auth login..."
        gcloud auth login
    fi
else
    echo "  Running in CI - using pre-configured auth"
fi

gsutil -m rsync -r -d "$PROJECT_ROOT/dist" "$GCS_BUCKET"

# Step 3: Set cache headers
echo ""
echo "→ Setting cache headers..."
# HTML: no cache (SPA routing)
gsutil -m setmeta -h "Cache-Control:no-cache, no-store" "$GCS_BUCKET/index.html"
# Assets: long cache (content-hashed filenames)
gsutil -m setmeta -r -h "Cache-Control:public, max-age=31536000, immutable" "$GCS_BUCKET/assets/"
# Data files: short cache (may be updated)
gsutil -m setmeta -r -h "Cache-Control:public, max-age=3600" "$GCS_BUCKET/data/" 2>/dev/null || true

echo ""
echo "✓ Deploy complete!"
