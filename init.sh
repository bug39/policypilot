#!/bin/bash
# PolicyPilot — Development Environment Init Script
# Run this at the start of every coding session.
# Usage: ./init.sh

set -e

echo "=== PolicyPilot Init ==="
echo ""

# 1. Verify working directory
EXPECTED_DIR="algoliahack"
CURRENT_DIR=$(basename "$(pwd)")
if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
  echo "ERROR: Expected to be in '$EXPECTED_DIR' directory, but in '$CURRENT_DIR'"
  echo "       cd to the project root first."
  exit 1
fi

# 2. Check prerequisites
echo "[1/5] Checking prerequisites..."

if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found. Install Node.js 18+ first."
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "ERROR: Node.js 18+ required. Found $(node -v)."
  exit 1
fi
echo "  Node.js $(node -v) ✓"

if ! command -v npm &> /dev/null; then
  echo "ERROR: npm not found."
  exit 1
fi
echo "  npm $(npm -v) ✓"

# 3. Install dependencies (if package.json exists)
echo ""
echo "[2/5] Installing dependencies..."
if [ -f "package.json" ]; then
  npm install --silent
  echo "  Dependencies installed ✓"
else
  echo "  No package.json found — skipping (project not yet scaffolded)"
fi

# 4. Check environment variables
echo ""
echo "[3/5] Checking environment..."
if [ -f ".env.local" ]; then
  # Verify required vars exist (without printing values)
  MISSING_VARS=""
  for VAR in ALGOLIA_APP_ID ALGOLIA_API_KEY ALGOLIA_AGENT_ID; do
    if ! grep -q "^${VAR}=" .env.local 2>/dev/null; then
      MISSING_VARS="$MISSING_VARS $VAR"
    fi
  done

  if [ -n "$MISSING_VARS" ]; then
    echo "  WARNING: Missing env vars in .env.local:$MISSING_VARS"
    echo "  Copy .env.example to .env.local and fill in values."
  else
    echo "  Environment variables configured ✓"
  fi
elif [ -f ".env.example" ]; then
  echo "  WARNING: .env.local not found. Copy .env.example to .env.local and fill in values."
  echo "  Run: cp .env.example .env.local"
else
  echo "  No .env.example or .env.local found — skipping (project not yet scaffolded)"
fi

# 5. Show project status
echo ""
echo "[4/5] Project status..."
echo "  Git branch: $(git branch --show-current 2>/dev/null || echo 'not a git repo')"
echo "  Last commit: $(git log --oneline -1 2>/dev/null || echo 'no commits')"

# Count feature progress
if [ -f "features.json" ]; then
  TOTAL=$(grep -c '"passes":' features.json 2>/dev/null || echo 0)
  DONE=$(grep -c '"passes": true' features.json 2>/dev/null || echo 0)
  echo "  Features: $DONE / $TOTAL complete"
fi

# 6. Start dev server (if project is scaffolded)
echo ""
echo "[5/5] Dev server..."
if [ -f "package.json" ] && grep -q '"dev"' package.json 2>/dev/null; then
  echo "  Starting dev server on http://localhost:3000"
  echo "  Press Ctrl+C to stop."
  echo ""
  npm run dev
else
  echo "  No dev script found — project not yet scaffolded."
  echo ""
  echo "=== Init complete. Ready to work. ==="
fi
