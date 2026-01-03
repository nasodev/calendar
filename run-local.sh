#!/bin/bash

# Calendar Frontend Development Server
# Runs on port 23002 for local development

export PORT=23002

echo "Starting Calendar dev server on http://localhost:$PORT"
npm run dev -- -p $PORT
