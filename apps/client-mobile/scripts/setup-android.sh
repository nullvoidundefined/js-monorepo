#!/bin/bash

# Script to set up Android development environment
# Run this script to fix common Android setup issues

set -e

echo "🤖 Android Development Environment Setup"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$PROJECT_ROOT/android"

echo -e "${BLUE}Project root:${NC} $PROJECT_ROOT"
echo ""

# Step 1: Check/Install Android Studio
check_android_studio() {
  echo "1️⃣  Checking Android Studio..."
  
  if [ -d "/Applications/Android Studio.app" ]; then
    echo -e "${GREEN}✓${NC} Android Studio is installed"
  else
    echo -e "${RED}✗${NC} Android Studio is not installed"
    echo ""
    echo "Please install Android Studio:"
    echo "  1. Download from: https://developer.android.com/studio"
    echo "  2. Install the app"
    echo "  3. Open Android Studio and complete the setup wizard"
    echo "  4. Install Android SDK (API level 34)"
    echo ""
    exit 1
  fi
}

# Step 2: Check/Set ANDROID_HOME
check_android_home() {
  echo ""
  echo "2️⃣  Checking ANDROID_HOME..."
  
  # Common Android SDK locations
  POSSIBLE_LOCATIONS=(
    "$HOME/Library/Android/sdk"
    "/usr/local/share/android-sdk"
  )
  
  ANDROID_SDK=""
  for location in "${POSSIBLE_LOCATIONS[@]}"; do
    if [ -d "$location" ]; then
      ANDROID_SDK="$location"
      break
    fi
  done
  
  if [ -z "$ANDROID_SDK" ]; then
    echo -e "${RED}✗${NC} Android SDK not found"
    echo ""
    echo "Please install Android SDK via Android Studio:"
    echo "  1. Open Android Studio"
    echo "  2. Go to: Preferences → Appearance & Behavior → System Settings → Android SDK"
    echo "  3. Install Android SDK (API 34 recommended)"
    echo ""
    exit 1
  fi
  
  echo -e "${GREEN}✓${NC} Android SDK found at: $ANDROID_SDK"
  
  # Check if ANDROID_HOME is set
  if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}⚠${NC} ANDROID_HOME not set in environment"
    echo ""
    echo "Add this to your ~/.zshrc (or ~/.bashrc):"
    echo ""
    echo "  export ANDROID_HOME=$ANDROID_SDK"
    echo "  export PATH=\$ANDROID_HOME/emulator:\$PATH"
    echo "  export PATH=\$ANDROID_HOME/platform-tools:\$PATH"
    echo "  export PATH=\$ANDROID_HOME/tools:\$PATH"
    echo ""
    echo "Then run: source ~/.zshrc"
    echo ""
    
    # Set for current session
    export ANDROID_HOME="$ANDROID_SDK"
    export PATH="$ANDROID_HOME/emulator:$PATH"
    export PATH="$ANDROID_HOME/platform-tools:$PATH"
    export PATH="$ANDROID_HOME/tools:$PATH"
    
    echo -e "${GREEN}✓${NC} ANDROID_HOME set for current session"
  else
    echo -e "${GREEN}✓${NC} ANDROID_HOME is set: $ANDROID_HOME"
  fi
}

# Step 3: Check/Install JDK 17
check_jdk() {
  echo ""
  echo "3️⃣  Checking JDK..."
  
  if /usr/libexec/java_home -v 17 &> /dev/null; then
    JDK_17=$(/usr/libexec/java_home -v 17)
    echo -e "${GREEN}✓${NC} JDK 17 found at: $JDK_17"
    export JAVA_HOME="$JDK_17"
  else
    echo -e "${YELLOW}⚠${NC} JDK 17 not found (Android requires JDK 17-20)"
    echo ""
    echo "Installing JDK 17..."
    echo "This will prompt for your password."
    echo ""
    
    # Try to install via Homebrew
    if command -v brew &> /dev/null; then
      echo "Please run in a terminal:"
      echo "  brew install --cask temurin@17"
      echo ""
      exit 1
    else
      echo "Please install JDK 17 from: https://adoptium.net/temurin/releases/?version=17"
      exit 1
    fi
  fi
}

# Step 4: Generate Gradle wrapper
generate_gradlew() {
  echo ""
  echo "4️⃣  Checking Gradle wrapper..."
  
  cd "$ANDROID_DIR"
  
  if [ -f "gradlew" ]; then
    echo -e "${GREEN}✓${NC} Gradle wrapper exists"
    chmod +x gradlew
  else
    echo -e "${YELLOW}⚠${NC} Gradle wrapper not found. Generating..."
    
    # Check if gradle is installed
    if ! command -v gradle &> /dev/null; then
      echo "Installing Gradle..."
      brew install gradle
    fi
    
    # Generate wrapper
    gradle wrapper --gradle-version=8.8
    
    if [ -f "gradlew" ]; then
      chmod +x gradlew
      echo -e "${GREEN}✓${NC} Gradle wrapper generated successfully"
    else
      echo -e "${RED}✗${NC} Failed to generate Gradle wrapper"
      exit 1
    fi
  fi
}

# Step 5: Check for emulators
check_emulators() {
  echo ""
  echo "5️⃣  Checking Android emulators..."
  
  if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}⚠${NC} ANDROID_HOME not set, skipping emulator check"
    return
  fi
  
  EMULATOR_CMD="$ANDROID_HOME/emulator/emulator"
  
  if [ -x "$EMULATOR_CMD" ]; then
    EMULATORS=$($EMULATOR_CMD -list-avds 2>/dev/null || echo "")
    
    if [ -z "$EMULATORS" ]; then
      echo -e "${YELLOW}⚠${NC} No Android emulators found"
      echo ""
      echo "To create an emulator:"
      echo "  1. Open Android Studio"
      echo "  2. Go to: Tools → Device Manager"
      echo "  3. Click 'Create Device'"
      echo "  4. Choose a device (e.g., Pixel 8)"
      echo "  5. Select a system image (API 34 recommended)"
      echo "  6. Name it and finish"
      echo ""
    else
      echo -e "${GREEN}✓${NC} Available emulators:"
      echo "$EMULATORS" | while read -r emulator; do
        echo "  - $emulator"
      done
    fi
  else
    echo -e "${YELLOW}⚠${NC} Emulator tool not found at: $EMULATOR_CMD"
  fi
}

# Main setup
main() {
  check_android_studio
  check_android_home
  check_jdk
  generate_gradlew
  check_emulators
  
  echo ""
  echo "========================================="
  echo -e "${GREEN}Setup Complete!${NC}"
  echo ""
  echo "📝 Next steps:"
  echo "  1. If you added ANDROID_HOME to ~/.zshrc, run: source ~/.zshrc"
  echo "  2. Install JDK 17 if needed: brew install --cask temurin@17"
  echo "  3. Create an Android emulator in Android Studio (if needed)"
  echo "  4. Start the emulator or connect a device"
  echo "  5. Run: npm run android"
  echo ""
}

main

