#!/bin/bash

# Script to get Android SHA1 fingerprint for OAuth configuration
# This is needed for Google OAuth setup in Android

set -e

echo "🔑 Android Debug Keystore SHA1 Fingerprint Tool"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Java is installed
check_java() {
  if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo -e "${GREEN}✓${NC} Java is installed: $JAVA_VERSION"
    return 0
  else
    echo -e "${RED}✗${NC} Java is not installed"
    return 1
  fi
}

# Install Java if not present
install_java() {
  echo ""
  echo -e "${YELLOW}Installing Java (Temurin JDK)...${NC}"
  echo "This will prompt for your password."
  echo ""
  
  if command -v brew &> /dev/null; then
    brew install --cask temurin
    echo ""
    echo -e "${GREEN}✓${NC} Java installed successfully!"
  else
    echo -e "${RED}✗${NC} Homebrew is not installed."
    echo "Please install Homebrew first: https://brew.sh"
    echo "Or install Java manually from: https://adoptium.net"
    exit 1
  fi
}

# Set JAVA_HOME
setup_java_home() {
  if [ -x /usr/libexec/java_home ]; then
    export JAVA_HOME=$(/usr/libexec/java_home)
    echo -e "${GREEN}✓${NC} JAVA_HOME set to: $JAVA_HOME"
  else
    echo -e "${YELLOW}⚠${NC} Could not set JAVA_HOME automatically"
  fi
}

# Check if debug keystore exists
check_keystore() {
  KEYSTORE_PATH="$HOME/.android/debug.keystore"
  
  if [ -f "$KEYSTORE_PATH" ]; then
    echo -e "${GREEN}✓${NC} Debug keystore found at: $KEYSTORE_PATH"
    return 0
  else
    echo -e "${YELLOW}⚠${NC} Debug keystore not found at: $KEYSTORE_PATH"
    echo ""
    echo "The debug keystore will be created automatically when you:"
    echo "  1. Run: npm run android"
    echo "  2. Or build the app in Android Studio"
    echo ""
    return 1
  fi
}

# Get SHA1 fingerprint
get_sha1() {
  KEYSTORE_PATH="$HOME/.android/debug.keystore"
  
  echo ""
  echo "📋 Extracting SHA1 fingerprint..."
  echo ""
  
  keytool -keystore "$KEYSTORE_PATH" -list -v -alias androiddebugkey -storepass android -keypass android | grep "SHA1:" || {
    echo -e "${RED}✗${NC} Failed to extract SHA1"
    exit 1
  }
  
  echo ""
  echo -e "${GREEN}✓${NC} Copy the SHA1 fingerprint above and add it to your Google Cloud Console:"
  echo "   1. Go to: https://console.cloud.google.com/apis/credentials"
  echo "   2. Edit your OAuth 2.0 Client ID"
  echo "   3. Add the SHA1 fingerprint under 'Android' section"
  echo ""
}

# Main execution
main() {
  # Check if Java is installed
  if ! check_java; then
    echo ""
    read -p "Would you like to install Java now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      install_java
      setup_java_home
    else
      echo ""
      echo "Please install Java manually:"
      echo "  brew install --cask temurin"
      echo ""
      echo "Or download from: https://adoptium.net"
      exit 1
    fi
  else
    setup_java_home
  fi
  
  # Check if keystore exists
  if check_keystore; then
    get_sha1
  else
    echo "Run this script again after building the Android app."
    exit 1
  fi
}

main

