#!/bin/bash

# Quick Start Server Script
# This script starts a local web server to test your site

echo "🚀 Starting local development server..."
echo ""
echo "Your site will be available at:"
echo "👉 http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "Opening browser in 2 seconds..."

# Wait 2 seconds then open browser
sleep 2 && open http://localhost:8000 &

# Start Python HTTP server
python3 -m http.server 8000
