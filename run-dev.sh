#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install and use Node 20.19.5 if not already installed
nvm install 20.19.5
nvm use 20.19.5

# Verify Node version
echo "Using Node version: $(node --version)"

# Start the dev server
npm run dev
