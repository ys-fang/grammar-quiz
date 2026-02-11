#!/bin/bash

# ============================================================================
# Frontend Deployment Script to GCS (Grammar Quiz — 國中英文解憂雜貨店)
# ============================================================================
# Builds the project and deploys dist/ to Google Cloud Storage.
#
# Usage:
#   ./scripts/deploy-gcs.sh [bucket-name] [gcs-path]
#
# Environment Variables (optional):
#   GCS_BUCKET: GCS bucket name (default: jutor-event-di1dzdgl64)
#   GCS_PATH: Path within bucket (default: event/grammar/junior)
#   COMPANY_ACCOUNT: Google account for authentication (default: ys.fang@junyiacademy.org)
#
# Features:
#   - Builds with VITE_BASE set to GCS path
#   - Deploys to GCS with proper Cache-Control headers
#   - Cleans old versioned assets before upload
# ============================================================================

set -e  # Exit on error

# Configuration
GCS_BUCKET="${1:-${GCS_BUCKET:-jutor-event-di1dzdgl64}}"
GCS_PATH="${2:-${GCS_PATH:-event/grammar/junior}}"
COMPANY_ACCOUNT="${COMPANY_ACCOUNT:-ys.fang@junyiacademy.org}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Grammar Quiz Deployment to GCS ===${NC}"
echo "Bucket: ${GCS_BUCKET}"
echo "Path: ${GCS_PATH}"
echo "Final URL: https://www.jutor.ai/${GCS_PATH}/"
echo ""

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check current Google account (skip in CI)
echo -e "${YELLOW}Checking Google Cloud authentication...${NC}"
CURRENT_ACCOUNT=$(gcloud config get-value account 2>/dev/null || echo "")
echo "Current account: ${CURRENT_ACCOUNT:-not set}"

if [ -z "$CI" ]; then
    if [ "$CURRENT_ACCOUNT" != "$COMPANY_ACCOUNT" ]; then
        echo -e "${YELLOW}Switching to company account: ${COMPANY_ACCOUNT}${NC}"
        echo "A browser window will open for authentication..."
        gcloud auth login --account="$COMPANY_ACCOUNT" 2>/dev/null || gcloud auth login
        echo -e "${GREEN}✓ Switched to company account${NC}"
    else
        echo -e "${GREEN}✓ Already using company account${NC}"
    fi
else
    echo -e "${GREEN}✓ Running in CI - using pre-configured auth${NC}"
fi
echo ""

# Build the frontend with GCS base path
echo -e "${YELLOW}Building grammar quiz (base: /${GCS_PATH}/)...${NC}"
cd "$PROJECT_ROOT"
VITE_BASE="/${GCS_PATH}/" npm run build

echo -e "${GREEN}✓ Build completed successfully${NC}"
echo ""

# Verify dist directory
DIST_DIR="$PROJECT_ROOT/dist"
if [ ! -f "$DIST_DIR/index.html" ]; then
    echo -e "${RED}Error: index.html not found in dist!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build output verified${NC}"
echo ""

# Clean old files from GCS
echo -e "${YELLOW}Cleaning old files from gs://${GCS_BUCKET}/${GCS_PATH}/...${NC}"
gsutil -m rm -r "gs://${GCS_BUCKET}/${GCS_PATH}/**" 2>/dev/null || echo "  (no old files to clean)"
echo -e "${GREEN}✓ Old files cleaned${NC}"
echo ""

# Upload files to GCS
echo -e "${YELLOW}Uploading files to GCS...${NC}"
cd "$DIST_DIR"

# 1. Upload index.html with no-cache (always fresh to pick up new asset hashes)
echo -e "${BLUE}  Uploading index.html (no-cache)...${NC}"
gsutil -h "Content-Type:text/html" \
       -h "Cache-Control:no-cache, max-age=0" \
       cp index.html "gs://${GCS_BUCKET}/${GCS_PATH}/index.html"

# 2. Upload hashed assets with long-term cache (Vite content-hashed filenames)
echo -e "${BLUE}  Uploading assets (long-term cache)...${NC}"
if [ -d "assets" ]; then
    gsutil -m -h "Cache-Control:public, max-age=31536000, immutable" \
           rsync -r assets "gs://${GCS_BUCKET}/${GCS_PATH}/assets"
fi

# 3. Upload data files with short cache (quiz JSON, may be updated)
echo -e "${BLUE}  Uploading data files (1h cache)...${NC}"
if [ -d "data" ]; then
    gsutil -m -h "Cache-Control:public, max-age=3600" \
           rsync -r data "gs://${GCS_BUCKET}/${GCS_PATH}/data"
fi

echo -e "${GREEN}✓ All files uploaded successfully${NC}"
echo ""

# Verify upload
echo -e "${YELLOW}Verifying uploaded files...${NC}"
gsutil ls -lh "gs://${GCS_BUCKET}/${GCS_PATH}/" | head -20
echo ""

# Display access URLs
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Direct GCS URL:"
echo "   https://storage.googleapis.com/${GCS_BUCKET}/${GCS_PATH}/index.html"
echo ""
echo "Production URL (via Cloudflare):"
echo "   https://www.jutor.ai/${GCS_PATH}/"
echo ""
