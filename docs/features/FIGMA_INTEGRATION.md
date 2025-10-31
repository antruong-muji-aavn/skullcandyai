# Figma Integration Feature

## Overview

The SkullCandy MCP server now includes a powerful integration with Figma MCP that automatically suggests matching components from our design system based on selected Figma frames.

## Feature: `suggest_components_from_figma`

### Description

When you select a frame or component in Figma, this tool:
1. Fetches design context from Figma MCP (get_design_context)
2. Analyzes the selected node's properties (name, type, content, etc.)
3. Matches against our SkullCandy design system components
4. Returns top 5 suggested components with:
   - Match score (0-100)
   - Match reasons
   - Import path
   - Props information
   - Usage examples

### Prerequisites

1. **Figma Desktop App** must be running
2. **Figma MCP Server** must be running on `http://127.0.0.1:3845/mcp`
3. A **frame or component must be selected** in Figma

### Usage

#### Via VS Code MCP Integration

```typescript
// Call the tool (no nodeId = uses currently selected node)
mcp_skullcandy_mc_suggest_components_from_figma()

// Or with specific node ID
mcp_skullcandy_mc_suggest_components_from_figma({ nodeId: "123:456" })
```

#### Via Direct API Call

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

#### With Node ID

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
      "arguments":{
        "nodeId":"123:456"
      }
    }
  }'
```

### Response Format

```json
{
  "meta": {
    "version": "0.1.0",
    "source": "skullcandy-mcp"
  },
  "data": {
    "figmaContext": {
      "name": "Primary Button",
      "type": "COMPONENT",
      "characters": "Buy Now",
      "fills": [...],
      "...": "..."
    },
    "suggestions": [
      {
        "component": "Button",
        "matchScore": 90,
        "matchReasons": [
          "Node name contains 'button'",
          "Has text content"
        ],
        "import": "@/components/button/Button",
        "props": {
          "style": ["CTA", "Neutral", "Stroke"],
          "size": ["L", "M", "S"]
        },
        "examples": [
          "<Button style=\"CTA\" size=\"M\">Buy Now</Button>",
          "<Button style=\"Neutral\" size=\"L\">Explore</Button>"
        ],
        "usage": "<Button style=\"CTA\" size=\"M\">Buy Now</Button>"
      },
      {
        "component": "NFTCard",
        "matchScore": 40,
        "matchReasons": ["Contains interactive elements"],
        "import": "@/components/nft-card/NFTCard",
        "...": "..."
      }
    ]
  }
}
```

## Matching Algorithm

The tool uses pattern matching based on:

### 1. Node Name Analysis
- `button`, `btn` → Suggests **Button** component
- `card` → Suggests **NFTCard** component
- `input`, `search` → Suggests **SearchBar** component
- `nav`, `menu` → Suggests **Navbar** component

### 2. Content Analysis
- Has text content → Increases relevance for Button, SearchBar
- Has image fills → Increases relevance for NFTCard
- Has multiple child nodes → Increases relevance for Card, Grid components

### 3. Match Scoring
- **90-100**: Highly confident match
- **70-89**: Good match
- **50-69**: Possible match
- **Below 50**: Weak match (not returned)

## Component Matching Rules

| Figma Pattern | Suggested Component | Match Score |
|---------------|---------------------|-------------|
| Name contains "button" | Button | 90 |
| Name contains "card" + has image | NFTCard | 85 |
| Name contains "search"/"input" | SearchBar | 90 |
| Name contains "nav"/"menu" | Navbar | 85 |
| Has grid layout | NFTGrid | 80 |
| Has heading text | SectionHeading | 75 |

## Example Workflow

1. **Select a Frame in Figma**
   - Open Figma Design file
   - Select a button component

2. **Call the Tool**
   ```typescript
   suggest_components_from_figma()
   ```

3. **Get Suggestions**
   ```json
   {
     "suggestions": [
       {
         "component": "Button",
         "matchScore": 90,
         "usage": "<Button style=\"CTA\" size=\"M\">Buy Now</Button>"
       }
     ]
   }
   ```

4. **Implement the Component**
   ```tsx
   import { Button } from '@/components/button/Button';
   
   <Button style="CTA" size="M">Buy Now</Button>
   ```

## Error Handling

### Common Errors

**Error**: `Failed to fetch Figma context: Failed to connect`
- **Cause**: Figma MCP server not running
- **Solution**: Ensure Figma desktop app is open and MCP server is running

**Error**: `No design context returned from Figma`
- **Cause**: No frame selected in Figma
- **Solution**: Select a frame/component in Figma before calling the tool

**Error**: `Figma MCP error: Invalid node ID`
- **Cause**: Provided node ID doesn't exist
- **Solution**: Check the node ID or omit it to use current selection

## Integration Architecture

```
┌─────────────────┐
│  Figma Desktop  │
│      App        │
└────────┬────────┘
         │
         │ MCP Protocol
         ↓
┌─────────────────┐
│   Figma MCP     │ ← Port 3845
│     Server      │
└────────┬────────┘
         │
         │ HTTP/JSON-RPC
         ↓
┌─────────────────┐
│  SkullCandy MCP │ ← Port 3000
│     Server      │
│  (suggest tool) │
└────────┬────────┘
         │
         ↓
   ┌─────────────┐
   │ Component   │
   │ Suggestions │
   └─────────────┘
```

## Future Enhancements

- [ ] Add more sophisticated ML-based matching
- [ ] Support for nested component suggestions
- [ ] Variant matching (suggest which props to use)
- [ ] Token mapping (suggest color/spacing tokens)
- [ ] Auto-generate component code
- [ ] Support for composition patterns
- [ ] Integration with VS Code extension for one-click insertion

## Related Tools

- `list_components` - List all available components
- `get_component_context` - Get detailed component info
- `compare_variants` - Check Figma/code parity
- Figma MCP `get_design_context` - Fetch Figma node data

## Configuration

The tool connects to Figma MCP at:
```
http://127.0.0.1:3845/mcp
```

To change this, modify `figmaUrl` in `src/app/mcp/route.ts`:
```typescript
const figmaUrl = process.env.FIGMA_MCP_URL || 'http://127.0.0.1:3845/mcp';
```

## Testing

```bash
# 1. Start Figma Desktop App

# 2. Open a design file

# 3. Select a frame/component

# 4. Call the tool
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"suggest_components_from_figma","arguments":{}}}'

# 5. Check suggestions in response
```

## Troubleshooting

### No Suggestions Returned

1. Check node name patterns match our components
2. Try different frames in Figma
3. Add more matching rules in `analyzeAndSuggestComponents()`

### Low Match Scores

- Refine the matching algorithm
- Add more context from Figma (text, fills, layout)
- Implement fuzzy matching for node names

### Figma MCP Connection Issues

```bash
# Test Figma MCP directly
curl -X POST http://127.0.0.1:3845/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# Should return list of Figma tools
```

## License

Part of SkullCandy Design System MCP Server
© 2025 ePost
