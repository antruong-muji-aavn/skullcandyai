# Native MCP Server Setup

## ✅ Setup Complete!

The SkullCandy MCP server is now configured as a **native MCP server** that integrates directly with VS Code Copilot, just like the Figma MCP server.

---

## 🎯 What Changed

### Before (HTTP Only)
```bash
# Had to manually call with curl
curl -X POST http://localhost:3000/mcp ...
```

### After (Native MCP)
```
✓ Ran suggest_components_from_figma – skullcandy-mcp (MCP Server)
```

The tool now appears automatically in Copilot's tool list!

---

## 📁 Files Created/Updated

### 1. Native MCP Server
**File:** `scripts/mcp/skullcandy-mcp-server.js`
- STDIO-based MCP server (v0.3.0)
- Communicates via MCP protocol
- Calls Next.js endpoint internally
- Enhanced with layout extraction, token analysis, implementation steps

### 2. VS Code Settings
**File:** `.vscode/settings.json`
- Registered `skullcandy-mcp` server
- Uses `node` to run the server
- Configured with workspace folder path

---

## 🚀 How to Use

### Step 1: Ensure Next.js Dev Server is Running
The native MCP server calls your Next.js endpoint internally:

```bash
pnpm dev
# Server must be running on http://localhost:3000
```

### Step 2: Reload VS Code Window
After configuration changes:
- Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
- Type: "Developer: Reload Window"
- Or just restart VS Code

### Step 3: The Tool Appears Automatically
When you chat with Copilot, the tool is available automatically:

```
You: "Analyze the selected Figma design"

Copilot will automatically call:
✓ Ran suggest_components_from_figma – skullcandy-mcp (MCP Server)
```

---

## 🔄 Two-Step Workflow (Now Both Native!)

### Step 1: Figma MCP (Native)
```
✓ Ran get_design_context – figma-mcp-server (MCP Server)
✓ Ran get_variable_defs – figma-mcp-server (MCP Server)
✓ Ran get_metadata – figma-mcp-server (MCP Server)
```

### Step 2: SkullCandy MCP (Native)
```
✓ Ran suggest_components_from_figma – skullcandy-mcp (MCP Server)
```

Both steps now use native MCP integration! 🎉

---

## 🛠️ Architecture

```
VS Code Copilot
   ↓
   ├─> Figma MCP Server (STDIO)
   │   └─> get_design_context, get_variable_defs, get_metadata
   │
   └─> SkullCandy MCP Server (STDIO) ← NEW!
       └─> suggest_components_from_figma
           ↓
       Calls internally:
       Next.js HTTP Endpoint (/mcp route)
           └─> Enhanced analysis logic (v0.3.0)
```

**Why this architecture?**
- Native MCP for clean Copilot integration
- HTTP endpoint for debugging and flexibility
- Best of both worlds!

---

## 🧪 Testing the Native MCP

### Test 1: Check if server is registered
```bash
# The server should start when VS Code launches
# Check VS Code's output panel for logs
```

### Test 2: Use in Copilot Chat
```
@workspace Get the Figma design context and analyze with SkullCandy MCP
```

Copilot should automatically:
1. Call Figma MCP tools
2. Call SkullCandy MCP tool
3. Show results with "(MCP Server)" label

---

## 📋 Enhanced Features (v0.3.0)

The native MCP server provides:

1. **Layout Extraction** - Detects flex-col/flex-row/grid patterns
2. **Design Token Analysis** - Extracts colors, typography, spacing, effects
3. **Component Matching** - Pattern detection with 90-100% confidence scores
4. **Implementation Steps** - Ordered guide with code examples
5. **Code Scaffolding** - Generated TypeScript component structure

---

## 🐛 Troubleshooting

### Server Not Appearing?

**Check 1: Next.js is running**
```bash
pnpm dev
# Should show: ready - started server on 0.0.0.0:3000
```

**Check 2: VS Code reloaded**
```
Cmd+Shift+P → "Developer: Reload Window"
```

**Check 3: Check VS Code output**
```
View → Output → Select "MCP Servers" from dropdown
```

### Tool Not Working?

**Error: "HTTP request failed"**
- Ensure Next.js dev server is running on port 3000
- Check the MCP endpoint: `http://localhost:3000/mcp`

**Error: "Unknown tool"**
- Reload VS Code window
- Check `.vscode/settings.json` configuration

---

## 🔄 Keeping HTTP Endpoint Too

The HTTP endpoint at `/mcp` route is still available for:
- ✅ Direct testing with curl
- ✅ Debugging and development
- ✅ Calling from other services
- ✅ Browser-based tools

**Use native MCP for:** Copilot integration  
**Use HTTP endpoint for:** Testing and debugging

---

## 📚 Related Documentation

- [Main Copilot Instructions](../../.github/copilot-instructions.md)
- [Figma MCP Workflow](../../docs/setup/FIGMA_MCP_WORKFLOW.md)
- [Component Patterns](../../.github/instructions/component-patterns.instructions.md)

---

**Status:** ✅ Native MCP Server Configured  
**Version:** 0.3.0 (Enhanced)  
**Updated:** November 3, 2025
