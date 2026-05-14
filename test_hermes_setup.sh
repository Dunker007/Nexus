#!/bin/bash

# Test script for Hermes Agent setup in Antigravity development environment

echo "🧪 Testing Hermes Agent Setup for Antigravity Development"
echo "========================================================"

# Check if Hermes is installed
echo "1. Checking Hermes installation..."
if command -v hermes &> /dev/null; then
    echo "   ✅ Hermes is installed"
    HERMES_VERSION=$(hermes --version)
    echo "   📦 Version: $HERMES_VERSION"
else
    echo "   ❌ Hermes is not installed"
    exit 1
fi

# Check if LM Studio is accessible
echo "2. Checking LM Studio connectivity..."
if curl -s http://172.24.144.1:1234/v1/models &> /dev/null; then
    echo "   ✅ LM Studio is accessible"
else
    echo "   ❌ LM Studio is not accessible"
    exit 1
fi

# Check Pieces OS integration
echo "3. Checking Pieces OS integration..."
if hermes mcp list | grep -q "pieces.*enabled"; then
    echo "   ✅ Pieces OS integration is active"
else
    echo "   ⚠️  Pieces OS integration may not be active"
fi

# Check project directory
echo "4. Checking project directory..."
if [ -d "/mnt/c/Github Repos/Nexus" ]; then
    echo "   ✅ Nexus project directory found"
else
    echo "   ❌ Nexus project directory not found"
fi

# Check ACP configuration
echo "5. Checking ACP configuration..."
if [ -f "/mnt/c/Github Repos/Nexus/hermes-acp-config.json" ]; then
    echo "   ✅ ACP configuration file found"
else
    echo "   ❌ ACP configuration file not found"
fi

# Run a simple Hermes query
echo "6. Testing Hermes functionality..."
cd /mnt/c/Github\ Repos/Nexus
if hermes chat -q "What is the name of this project?" --timeout 30 &> /dev/null; then
    echo "   ✅ Hermes query successful"
else
    echo "   ❌ Hermes query failed"
fi

echo "========================================================"
echo "🧪 Hermes Agent Setup Test Complete"