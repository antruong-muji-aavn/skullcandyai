#!/bin/bash
#
# Verify Native MCP Server Setup
# This script checks if the native MCP server is properly configured
#

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   SkullCandy MCP - Native Server Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Server file exists
echo "1. Checking server file..."
if [ -f "scripts/mcp/skullcandy-mcp-server.js" ]; then
    echo -e "   ${GREEN}✓${NC} Server file exists"
else
    echo -e "   ${RED}✗${NC} Server file not found"
    exit 1
fi

# Check 2: Server is executable
echo "2. Checking permissions..."
if [ -x "scripts/mcp/skullcandy-mcp-server.js" ]; then
    echo -e "   ${GREEN}✓${NC} Server is executable"
else
    echo -e "   ${YELLOW}⚠${NC} Making server executable..."
    chmod +x scripts/mcp/skullcandy-mcp-server.js
fi

# Check 3: VS Code settings exist
echo "3. Checking VS Code configuration..."
if [ -f ".vscode/settings.json" ]; then
    echo -e "   ${GREEN}✓${NC} VS Code settings file exists"
    
    # Check if MCP server is configured
    if grep -q "skullcandy-mcp" .vscode/settings.json; then
        echo -e "   ${GREEN}✓${NC} MCP server is configured"
    else
        echo -e "   ${RED}✗${NC} MCP server not configured in settings"
        exit 1
    fi
else
    echo -e "   ${RED}✗${NC} VS Code settings file not found"
    exit 1
fi

# Check 4: Test server initialization
echo "4. Testing server initialization..."
INIT_RESPONSE=$(echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node scripts/mcp/skullcandy-mcp-server.js 2>/dev/null)

if echo "$INIT_RESPONSE" | grep -q "skullcandy-mcp"; then
    echo -e "   ${GREEN}✓${NC} Server initializes correctly"
    
    # Extract version
    VERSION=$(echo "$INIT_RESPONSE" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo -e "   ${GREEN}✓${NC} Server version: $VERSION"
else
    echo -e "   ${RED}✗${NC} Server initialization failed"
    exit 1
fi

# Check 5: Next.js server
echo "5. Checking Next.js server..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Next.js server is running on port 3000"
else
    echo -e "   ${YELLOW}⚠${NC} Next.js server not running (run 'pnpm dev')"
fi

# Check 6: Documentation
echo "6. Checking documentation..."
if [ -f "scripts/mcp/NATIVE_MCP_SETUP.md" ]; then
    echo -e "   ${GREEN}✓${NC} Setup documentation exists"
else
    echo -e "   ${YELLOW}⚠${NC} Setup documentation not found"
fi

if [ -f "scripts/mcp/QUICK_REFERENCE.md" ]; then
    echo -e "   ${GREEN}✓${NC} Quick reference exists"
else
    echo -e "   ${YELLOW}⚠${NC} Quick reference not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✓ All checks passed!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Reload VS Code: Cmd+Shift+P → 'Developer: Reload Window'"
echo "  2. Ensure Next.js is running: pnpm dev"
echo "  3. Test in Copilot: 'Analyze the selected Figma design'"
echo ""
echo "The tool should appear as:"
echo "  ✓ Ran suggest_components_from_figma – skullcandy-mcp (MCP Server)"
echo ""
