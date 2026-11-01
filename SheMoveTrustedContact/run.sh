#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "🚀 Starting SheMove Police & Safety Dashboard on port ${PORT:-3000}..."
echo "🔗 Connected to FastAPI Backend at: ${BACKEND_URL:-http://127.0.0.1:8000}"
exec npm run dev -- -p "${PORT:-3000}"

