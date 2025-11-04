#!/bin/bash
#
# MCP Tools Test Suite
# Tests all 15 tools across 5 tiers
#

API_BASE="http://localhost:3000/mcp"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   SkullCandy MCP - Tool Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if server is running
echo -n "Checking if Next.js server is running... "
if curl -s $API_BASE > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo ""
    echo "Error: Next.js server is not running on port 3000"
    echo "Please run: pnpm dev"
    exit 1
fi

echo ""

# Test 1: GET /mcp - List all tools
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 1: GET /mcp - List all tools${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s $API_BASE)
TOOL_COUNT=$(echo "$RESPONSE" | grep -o '"name"' | wc -l | tr -d ' ')

echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -30

if [ "$TOOL_COUNT" -eq 15 ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Found all 15 tools"
else
    echo -e "\n${RED}✗ FAIL${NC} - Expected 15 tools, found $TOOL_COUNT"
fi

echo ""
sleep 1

# Test 2: TIER 0 - list_components
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 2: TIER 0 - list_components${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "list_components",
    "arguments": {}
  }')

echo "Request: list_components (no filters)"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -20

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ "$STATUS" = "ok" ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - list_components working"
else
    echo -e "\n${RED}✗ FAIL${NC} - Status: $STATUS"
fi

echo ""
sleep 1

# Test 3: TIER 0 - list_components with query
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 3: TIER 0 - list_components (with query)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "list_components",
    "arguments": {
      "query": "button",
      "limit": 5
    }
  }')

echo "Request: list_components (query='button', limit=5)"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ "$STATUS" = "ok" ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Fuzzy search working"
else
    echo -e "\n${RED}✗ FAIL${NC} - Status: $STATUS"
fi

echo ""
sleep 1

# Test 4: TIER 0 - get_component_context
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 4: TIER 0 - get_component_context${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "get_component_context",
    "arguments": {
      "name": "Button"
    }
  }')

echo "Request: get_component_context (name='Button')"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -40

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
HAS_CODE=$(echo "$RESPONSE" | grep -c '"code"')
HAS_FIGMA=$(echo "$RESPONSE" | grep -c '"figma"')
HAS_A11Y=$(echo "$RESPONSE" | grep -c '"a11y"')

if [ "$STATUS" = "ok" ] && [ "$HAS_CODE" -gt 0 ] && [ "$HAS_FIGMA" -gt 0 ] && [ "$HAS_A11Y" -gt 0 ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Component context complete (code, figma, a11y)"
else
    echo -e "\n${RED}✗ FAIL${NC} - Missing sections"
fi

echo ""
sleep 1

# Test 5: TIER 0 - compare_variants
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 5: TIER 0 - compare_variants${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "compare_variants",
    "arguments": {
      "name": "Button"
    }
  }')

echo "Request: compare_variants (name='Button')"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ "$STATUS" = "ok" ] || [ "$STATUS" = "warn" ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Variant comparison working"
else
    echo -e "\n${RED}✗ FAIL${NC} - Status: $STATUS"
fi

echo ""
sleep 1

# Test 6: TIER 0 - list_tokens
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 6: TIER 0 - list_tokens${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "list_tokens",
    "arguments": {
      "scope": ["color", "spacing"]
    }
  }')

echo "Request: list_tokens (scope=['color','spacing'])"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null | head -30

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ "$STATUS" = "ok" ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Token listing working"
else
    echo -e "\n${RED}✗ FAIL${NC} - Status: $STATUS"
fi

echo ""
sleep 1

# Test 7: TIER 1 - extract_layout
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 7: TIER 1 - extract_layout${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "extract_layout",
    "arguments": {
      "figma_node": {
        "layoutMode": "VERTICAL",
        "itemSpacing": 16,
        "primaryAxisAlignItems": "CENTER",
        "counterAxisAlignItems": "START"
      }
    }
  }')

echo "Request: extract_layout (Figma node with VERTICAL layout)"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
HAS_DISPLAY=$(echo "$RESPONSE" | grep -c '"display"')
HAS_DIRECTION=$(echo "$RESPONSE" | grep -c '"direction"')

if [ "$STATUS" = "ok" ] && [ "$HAS_DISPLAY" -gt 0 ] && [ "$HAS_DIRECTION" -gt 0 ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Layout extraction working"
else
    echo -e "\n${RED}✗ FAIL${NC} - Missing layout properties"
fi

echo ""
sleep 1

# Test 8: TIER 1 - analyze_tokens
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 8: TIER 1 - analyze_tokens${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "analyze_tokens",
    "arguments": {
      "figma_node": {
        "fills": [{"type": "SOLID", "color": {"r": 0.05, "g": 0.31, "b": 0.97}}],
        "paddingLeft": 16,
        "cornerRadius": 8
      }
    }
  }')

echo "Request: analyze_tokens (Figma node with fills, padding, radius)"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
HAS_CONFIDENCE=$(echo "$RESPONSE" | grep -c '"confidence"')

if [ "$STATUS" = "ok" ] && [ "$HAS_CONFIDENCE" -gt 0 ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Token analysis with confidence scores"
else
    echo -e "\n${RED}✗ FAIL${NC} - Status: $STATUS"
fi

echo ""
sleep 1

# Test 9: TIER 1 - match_components
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 9: TIER 1 - match_components${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "match_components",
    "arguments": {
      "figma_node": {
        "name": "Primary Button",
        "id": "123:456"
      }
    }
  }')

echo "Request: match_components (Figma node named 'Primary Button')"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
if [ "$STATUS" = "ok" ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Component matching working"
else
    echo -e "\n${RED}✗ FAIL${NC} - Status: $STATUS"
fi

echo ""
sleep 1

# Test 10: TIER 2 - implementation_steps
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST 10: TIER 2 - implementation_steps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "implementation_steps",
    "arguments": {
      "component": "Button"
    }
  }')

echo "Request: implementation_steps (component='Button')"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
HAS_STEPS=$(echo "$RESPONSE" | grep -c '"steps"')

if [ "$STATUS" = "ok" ] && [ "$HAS_STEPS" -gt 0 ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Implementation steps generated"
else
    echo -e "\n${RED}✗ FAIL${NC} - Missing steps"
fi

echo ""
sleep 1

# Test 11-15: Placeholder tools
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TESTS 11-15: Remaining tools (placeholders)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TOOLS=("scaffold_component" "scaffold_screen" "validate_token_usage" "validate_a11y_rules" "diff_figma_vs_code" "generate_docs" "export_story")

for TOOL in "${TOOLS[@]}"; do
    echo -n "Testing $TOOL... "
    RESPONSE=$(curl -s -X POST $API_BASE \
      -H "Content-Type: application/json" \
      -d "{\"tool\": \"$TOOL\", \"arguments\": {}}")
    
    STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" = "ok" ]; then
        echo -e "${YELLOW}✓ OK${NC} (placeholder)"
    else
        echo -e "${RED}✗ FAIL${NC}"
    fi
done

echo ""

# Test Error Handling
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}TEST: Error Handling - Unknown Tool${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "invalid_tool",
    "arguments": {}
  }')

echo "Request: invalid_tool"
echo "Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null

STATUS=$(echo "$RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
HAS_ERROR_CODE=$(echo "$RESPONSE" | grep -c '"UNKNOWN_TOOL"')

if [ "$STATUS" = "error" ] && [ "$HAS_ERROR_CODE" -gt 0 ]; then
    echo -e "\n${GREEN}✓ PASS${NC} - Error handling working"
else
    echo -e "\n${RED}✗ FAIL${NC} - Error handling not working"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   Test Suite Complete"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
