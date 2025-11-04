# Testing Guide: Figma Component Suggestion Feature

## Quick Test Checklist

### Prerequisites ✅

- [ ] Figma Desktop app is installed
- [ ] Figma MCP server is configured and running
- [ ] SkullCandy MCP dev server is running (`pnpm dev`)
- [ ] A Figma design file is open

### Test Scenarios

## Scenario 1: Test Button Suggestion

**Setup:**
1. Open Figma Desktop
2. Open your design file (or SkullCandy design system file)
3. Select any button component (or create a frame named "Button" with text)

**Test Command:**
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params":{
      "name":"suggest_components_from_figma",
      "arguments":{}
    }
  }'
```

**Expected Output:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{
          \"meta\": {...},
          \"data\": {
            \"figmaContext\": {
              \"name\": \"Button\",
              \"type\": \"COMPONENT\",
              \"characters\": \"Buy Now\"
            },
            \"suggestions\": [
              {
                \"component\": \"Button\",
                \"matchScore\": 90,
                \"matchReasons\": [
                  \"Node name contains 'button'\",
                  \"Has text content\"
                ],
                \"usage\": \"<Button style=\\\"CTA\\\" size=\\\"M\\\">Buy Now</Button>\"
              }
            ]
          }
        }"
      }
    ]
  }
}
```

**Validation:**
- [ ] Button component has highest match score (90)
- [ ] Match reasons mention "button" in node name
- [ ] Usage example includes actual text from Figma button
- [ ] Import path is correct (`@/components/button/Button`)

---

## Scenario 2: Test Card Suggestion

**Setup:**
1. In Figma, select a card component (or create frame named "Product Card" with an image)

**Test Command:**
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"tools/call",
    "params":{
      "name":"suggest_components_from_figma",
      "arguments":{}
    }
  }'
```

**Expected:**
- [ ] NFTCard component suggested (score 85+)
- [ ] Match reasons mention "card" or "has image"
- [ ] Usage example shows NFTCard props

---

## Scenario 3: Test Search Input Suggestion

**Setup:**
1. Select an input field or search bar in Figma (or create frame named "Search")

**Expected:**
- [ ] SearchBar component suggested (score 90)
- [ ] Match reasons mention "input" or "search"
- [ ] Usage example includes placeholder text from Figma

---

## Scenario 4: Test with Specific Node ID

**Setup:**
1. In Figma, copy node ID from a component:
   - Right-click component → Copy → Copy as → Copy link
   - Extract node-id from URL: `?node-id=123-456`
   - Convert to `123:456` format

**Test Command:**
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":3,
    "method":"tools/call",
    "params":{
      "name":"suggest_components_from_figma",
      "arguments":{
        "nodeId":"123:456"
      }
    }
  }'
```

**Expected:**
- [ ] Specific node is analyzed (not current selection)
- [ ] Suggestions match the node ID component

---

## Scenario 5: Test Error Handling

### Test A: No Figma Selection

**Setup:**
1. Don't select any frame in Figma (click empty canvas)

**Expected Error:**
```json
{
  "error": {
    "message": "No design context returned from Figma"
  }
}
```

### Test B: Figma MCP Not Running

**Setup:**
1. Close Figma Desktop app

**Expected Error:**
```json
{
  "error": {
    "message": "Failed to fetch Figma context: Failed to connect..."
  }
}
```

### Test C: Invalid Node ID

**Test Command:**
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc":"2.0",
    "id":4,
    "method":"tools/call",
    "params":{
      "name":"suggest_components_from_figma",
      "arguments":{
        "nodeId":"999:999"
      }
    }
  }'
```

**Expected Error:**
```json
{
  "error": {
    "message": "Figma MCP error: Invalid node ID"
  }
}
```

---

## Debugging Tools

### Check MCP Server Status

```bash
# Test local MCP server
curl http://localhost:3000/mcp

# List all tools
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Should show 5 tools including suggest_components_from_figma
```

### Check Figma MCP Status

```bash
# Test Figma MCP server
curl http://127.0.0.1:3845/mcp

# List Figma tools
curl -X POST http://127.0.0.1:3845/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Should show get_design_context tool
```

### Check Dev Server Logs

```bash
# Watch Next.js dev server logs
tail -f .next/trace

# Or check terminal where pnpm dev is running
```

---

## Verification Checklist

After running all scenarios:

- [ ] Button components are correctly identified (score 90)
- [ ] Card components get NFTCard suggestion (score 85)
- [ ] Input/search components get SearchBar suggestion (score 90)
- [ ] Navigation components get Navbar suggestion (score 85)
- [ ] Match reasons are accurate and descriptive
- [ ] Usage examples include actual Figma text content
- [ ] Import paths are correct for all suggestions
- [ ] Error messages are clear and helpful
- [ ] Response format follows JSON-RPC 2.0 spec
- [ ] Tool appears in tools/list output

---

## Performance Benchmarks

Expected response times:

| Operation | Time |
|-----------|------|
| **Figma MCP fetch** | < 500ms |
| **Component analysis** | < 100ms |
| **Total response** | < 1s |

If slower:
- Check Figma MCP server performance
- Verify network latency
- Check if Figma file is large (many nodes)

---

## Common Issues

### Issue: "Failed to connect to localhost port 3000"

**Solution:** Start dev server
```bash
pnpm dev
```

### Issue: "Figma MCP error: Method not allowed"

**Solution:** 
- Ensure Figma **Design** file is open (not FigJam)
- Check Figma MCP configuration in VS Code

### Issue: "No design context returned"

**Solution:**
- Select a frame/component in Figma
- Verify frame is not locked
- Check frame is in current page

### Issue: Low match scores (< 50)

**Solution:**
- Use descriptive frame names (e.g., "Button", "Card")
- Add text content to frames
- Add images to card components
- Review matching algorithm in `analyzeAndSuggestComponents()`

---

## Advanced Testing

### Test Match Score Accuracy

Create test frames with different patterns:

| Frame Name | Expected Component | Expected Score |
|------------|-------------------|----------------|
| "Primary Button" | Button | 90 |
| "CTA Button Large" | Button | 90 |
| "Product Card" | NFTCard | 85 |
| "Search Input" | SearchBar | 90 |
| "Navigation Bar" | Navbar | 85 |
| "Menu" | Navbar | 85 |

### Test Content Analysis

- **Text Content**: Button with text should score higher than empty frame
- **Image Content**: Card with image should get NFTCard suggestion
- **Multiple Children**: Complex components should still match

### Test Edge Cases

- [ ] Empty frame (no name, no content)
- [ ] Frame with special characters in name
- [ ] Deeply nested components
- [ ] Very large components (many children)
- [ ] Components with effects (blur, shadow)

---

## Reporting Issues

If you find bugs or unexpected behavior:

1. **Capture Request:**
   ```bash
   curl -v ... > test-output.txt
   ```

2. **Include Details:**
   - Figma frame structure (screenshot)
   - Expected vs actual suggestions
   - Match scores and reasons
   - Error messages

3. **Check Logs:**
   - Next.js dev server console
   - Browser network tab (if testing via VS Code)

4. **File Issue:**
   - GitHub Issues with `figma-integration` label
   - Include request/response JSON
   - Screenshots of Figma frame

---

## Success Criteria

The feature is working correctly when:

✅ All 5 test scenarios pass  
✅ Match scores are accurate and reasonable  
✅ Match reasons are descriptive  
✅ Usage examples use actual Figma content  
✅ Error messages are clear  
✅ Response time is under 1 second  
✅ Works with both selected node and nodeId parameter  
✅ Integration with Figma MCP is stable  

---

## Next Steps After Testing

1. **Refine Algorithm:** Based on test results, improve matching logic
2. **Add Patterns:** Extend to all 9 components (currently 4)
3. **Deploy:** Push to Vercel for cloud testing
4. **Documentation:** Update with real-world examples
5. **Enhancement:** Consider ML-based matching for better accuracy
