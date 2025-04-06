#!/bin/bash

# Define the required Node.js version
NODE_VERSION="20.5.0"

# Check if nvm is available
if [ -z "$(command -v nvm)" ]; then
  # Try to load nvm if it's installed but not in PATH
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  
  # Check again after attempting to load
  if [ -z "$(command -v nvm)" ]; then
    echo "nvm is not installed or not in the PATH. You need to install nvm first."
    echo "Visit https://github.com/nvm-sh/nvm for installation instructions."
    exit 1
  fi
fi

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# Use the version specified in .nvmrc if it exists
if [ -f ".nvmrc" ]; then
  echo "Using Node.js version specified in .nvmrc"
  nvm use
else
  echo ".nvmrc file not found. Using Node.js v${NODE_VERSION}"
  nvm use ${NODE_VERSION}
fi

# Double-check that we're using the correct Node version
CURRENT_NODE_VERSION=$(node -v)
if [[ "$CURRENT_NODE_VERSION" != *"$NODE_VERSION"* ]]; then
  echo "Warning: Expected Node.js version $NODE_VERSION, but got $CURRENT_NODE_VERSION"
  echo "Attempting to force use of correct version..."
  nvm use ${NODE_VERSION}
fi

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"
echo ""
echo "Your environment is now set up for this project."
echo "To run the development server, use: npm run dev" 