# SkullCandy MCP - Quick Reference

## ✅ Native MCP Server Active

```
✓ Ran suggest_components_from_figma – skullcandy-mcp (MCP Server)
```

---

## 🚀 Quick Start

### 1. Start Next.js Dev Server
```bash
pnpm dev
```

### 2. Reload VS Code
```
Cmd+Shift+P → Developer: Reload Window
```

### 3. Use in Copilot
```
Get the Figma design context and analyze with SkullCandy MCP
```

---

## 📊 Comparison: Before vs After

| Aspect | Before (HTTP Only) | After (Native MCP) |
|--------|-------------------|-------------------|
| **Integration** | Manual curl calls | Automatic tool detection |
| **Display** | `curl -X POST...` | `✓ Ran ... – skullcandy-mcp (MCP Server)` |
| **User Experience** | Developer must call manually | Copilot calls automatically |
| **Consistency** | Different from Figma MCP | Same as Figma MCP ✅ |

---

## 🔄 Two-Step Workflow (Both Native Now!)

### Complete Workflow Example

```
User: "Analyze the selected Figma design"

Copilot automatically executes:

STEP 1: Figma MCP
  ✓ Ran get_design_context – figma-mcp-server (MCP Server)
  ✓ Ran get_variable_defs – figma-mcp-server (MCP Server)
  ✓ Ran get_metadata – figma-mcp-server (MCP Server)

STEP 2: SkullCandy MCP
  ✓ Ran suggest_components_from_figma – skullcandy-mcp (MCP Server)

Result: Complete implementation materials!
```

---

## 🛠️ Files Created

| File | Purpose |
|------|---------|
| `scripts/mcp/skullcandy-mcp-server.js` | Native STDIO MCP server |
| `.vscode/settings.json` | VS Code MCP configuration |
| `scripts/mcp/NATIVE_MCP_SETUP.md` | Full setup documentation |

---

## 📦 What You Get (v0.3.0)

```json
{
  "layout": {
    "structure": { "type": "container", "layout": "flex-col" }
  },
  "tokens": {
    "colors": [...],
    "typography": [...],
    "spacing": [...],
    "effects": [...],
    "borders": [...]
  },
  "components": {
    "suggestions": [
      { "component": "NFTCard", "matchScore": 100 },
      { "component": "Button", "matchScore": 98 }
    ]
  },
  "implementation": {
    "steps": [...],
    "scaffold": "// Complete TypeScript component"
  }
}
```

---

## 🎯 Usage Examples

### Example 1: Full Workflow
```
@workspace Select a Figma frame and get implementation materials
```

### Example 2: Direct Call
```
Analyze the current Figma design with SkullCandy MCP
```

### Example 3: Component Matching
```
What components match this Figma design?
```

---

## 🔧 Configuration

### VS Code Settings (`.vscode/settings.json`)
```json
{
  "github.copilot.chat.mcpServers": {
    "skullcandy-mcp": {
      "command": "node",
      "args": ["${workspaceFolder}/scripts/mcp/skullcandy-mcp-server.js"],
      "env": { "NODE_ENV": "development" }
    }
  }
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Server not appearing | Reload VS Code window |
| Tool not working | Ensure `pnpm dev` is running on port 3000 |
| HTTP errors | Check Next.js server logs |
| Tool not listed | Check VS Code Output → MCP Servers |

---

## ✨ Benefits

- ✅ **Consistent UX** - Matches Figma MCP display
- ✅ **Automatic** - Copilot calls the tool automatically
- ✅ **Native Integration** - Clean "(MCP Server)" label
- ✅ **No Manual Calls** - No more curl commands needed
- ✅ **Enhanced v0.3.0** - Layout, tokens, components, steps, scaffold

---

**Status:** ✅ ACTIVE  
**Version:** 0.3.0  
**Date:** November 3, 2025
