#!/usr/bin/env bash
# Starts a quick public HTTPS Cloudflare Tunnel pointing to SheMove backend on port 8000
echo "🚀 Starting Cloudflare Tunnel for SheMove Backend on port 8000..."
cloudflared tunnel --url http://127.0.0.1:8000

