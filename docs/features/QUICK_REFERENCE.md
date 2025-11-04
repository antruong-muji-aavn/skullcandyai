# Quick Reference: Figma Component Suggestions

## 🚀 Quick Start

```bash
# 1. Open Figma Desktop with design file
# 2. Select a frame/component
# 3. Run:

curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"suggest_components_from_figma","arguments":{}}}'
```

## 📋 Component Patterns

| Figma Pattern | Component | Score |
|---------------|-----------|-------|
| Name: "button", "btn" | **Button** | 90 |
| Name: "card" + image | **NFTCard** | 85 |
| Name: "input", "search" | **SearchBar** | 90 |
| Name: "nav", "menu" | **Navbar** | 85 |

## 🎯 Response Format

```json
{
  "data": {
    "suggestions": [
      {
        "component": "Button",
        "matchScore": 90,
        "matchReasons": ["Node name contains 'button'"],
        "import": "@/components/button/Button",
        "usage": "<Button style=\"CTA\">Buy Now</Button>"
      }
    ]
  }
}
```

## 🔧 Common Commands

### Test with Current Selection
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"suggest_components_from_figma","arguments":{}}}'
```

### Test with Node ID
```bash
# Get node ID from Figma URL: ?node-id=123-456 → 123:456
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"suggest_components_from_figma","arguments":{"nodeId":"123:456"}}}'
```

### List All Tools
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 🐛 Troubleshooting

| Error | Fix |
|-------|-----|
| Connection refused (port 3000) | Run `pnpm dev` |
| Connection refused (port 3845) | Open Figma Desktop |
| "No design context" | Select a frame in Figma |
| "Method not allowed" | Use Design file, not FigJam |

## 📊 Match Scores

- **90-100**: Highly confident (Button, SearchBar)
- **70-89**: Good match (NFTCard, Navbar)
- **50-69**: Possible match
- **< 50**: Not returned

## ⚡ Performance

- Figma fetch: < 500ms
- Analysis: < 100ms
- **Total: < 1s**

## 🔗 Full Documentation

- [FIGMA_INTEGRATION.md](./FIGMA_INTEGRATION.md) - Complete guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - All test scenarios
- [../api/figma-mcp.md](../api/figma-mcp.md) - Figma MCP details

## 💡 Tips

1. **Use descriptive names**: "Primary Button" > "Frame 1"
2. **Add content**: Text/images improve matching
3. **Test variations**: Different frame types
4. **Check scores**: Higher = better match
5. **Review reasons**: Understand why it matched
