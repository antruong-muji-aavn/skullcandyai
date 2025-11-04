# Quick Reference: Figma → SkullCandy MCP

> **TL;DR**: Call Figma MCP first → paste output → get component suggestions

---

## 🚀 Two Commands

### 1️⃣ Get Figma Design (Figma MCP)

```bash
Cmd+Shift+P → /mcp.figma-mcp-ser.get_design_context
```

**Output:** TSX code

### 2️⃣ Analyze Design (SkullCandy MCP)

```bash
Cmd+Shift+P → /mcp.skullcandy-mcp-server.suggest_components_from_figma
designContext: "<paste TSX here>"
```

**Output:** Component suggestions with match scores

---

## 📋 Input Options

| Input | Get From | Best For |
|-------|----------|----------|
| `designContext` | `get_design_context()` | Full analysis |
| `metadata` | `get_metadata()` | Quick check |
| `variables` | `get_variable_defs()` | Token verification |

**Minimum:** One input required  
**Recommended:** Use `designContext` for best results

---

## 🎯 Match Scores

| Score | Meaning |
|-------|---------|
| 95-100 | ✅ Use as-is |
| 85-94 | 👍 Good match |
| 70-84 | ⚠️ Review needed |
| <70 | ❌ Custom build |

---

## 💡 Example Output

```json
{
  "component": "NFTCard",
  "matchScore": 98,
  "matchReasons": [
    "Detected card pattern",
    "Contains image",
    "Has countdown timer"
  ],
  "import": "import { NFTCard } from '@/components/nft-card/NFTCard';",
  "usage": "<NFTCard price=\"3.75 ETH\" timeLeft=\"4h:12m:34s\" />"
}
```

---

## 🔧 Troubleshooting

**Error: "At least one input must be provided"**
→ Call Figma MCP first, then paste output

**Low match scores**
→ Provide both `designContext` AND `metadata` for better accuracy

**Tool not found**
→ Ensure MCP servers are running (check VS Code MCP settings)

---

## 📚 Full Docs

[Complete Workflow Guide](./FIGMA_MCP_WORKFLOW.md)
