# Figma MCP → SkullCandy MCP Workflow

> **Updated**: 2025-11-01  
> **Strategy**: Two-step workflow to avoid MCP-to-MCP communication issues

## Overview

Instead of SkullCandy MCP calling Figma MCP internally (which causes Bad Request errors), we use a **two-step workflow**:

1. **User calls Figma MCP tools directly** via VS Code command palette
2. **User passes the output** to SkullCandy MCP for component analysis

---

## 🚀 Quick Start

### Step 1: Get Figma Design Context

**Via Command Palette:**
```
Cmd+Shift+P → /mcp.figma-mcp-ser.get_design_context
```

**Result:** TSX/React code representing the Figma design

### Step 2: Analyze with SkullCandy MCP

**Via Command Palette:**
```
Cmd+Shift+P → /mcp.skullcandy-mcp-server.suggest_components_from_figma
```

**Input:** Paste the TSX code from Step 1 into the `designContext` parameter

**Result:** Component suggestions with match scores

---

## 📋 Detailed Workflow

### Option A: Full Analysis (Recommended)

**1. Get Design Context (Figma MCP)**
```bash
# In VS Code Command Palette
/mcp.figma-mcp-ser.get_design_context

# OR specify node ID
/mcp.figma-mcp-ser.get_design_context nodeId="121:6096"
```

**Output Example:**
```tsx
function Navigation({ className }: { className?: string; }) {
  return <div className={className} data-name="Navigation" data-node-id="4:1688">
    <p className="text-white">Market</p>
    <p className="text-white">Features</p>
  </div>;
}
```

**2. Get Design Tokens (Optional but Recommended)**
```bash
/mcp.figma-mcp-ser.get_variable_defs nodeId="121:6096"
```

**Output Example:**
```json
{
  "Font Family/Title": "Orbitron",
  "Font Family/Body": "Outfit",
  "Glass Blur Amount": "200",
  "Color/Glass Light": "#ffffff1a"
}
```

**3. Get Metadata (Optional)**
```bash
/mcp.figma-mcp-ser.get_metadata nodeId="121:6096"
```

**Output Example:**
```xml
<Page id="121:6096" name="Monthy Collection">
  <Header id="121:6098" name="Title" />
  <SearchField id="121:6102" name="Search Field" />
</Page>
```

**4. Analyze with SkullCandy MCP**
```bash
/mcp.skullcandy-mcp-server.suggest_components_from_figma
```

**Parameters:**
```json
{
  "designContext": "<paste TSX from step 1>",
  "variables": "<paste JSON from step 2>",
  "metadata": "<paste XML from step 3>"
}
```

**Output:**
```json
{
  "meta": {
    "version": "0.2.0",
    "source": "skullcandy-mcp",
    "workflow": "two-step (Figma MCP → SkullCandy MCP)"
  },
  "data": {
    "suggestions": [
      {
        "component": "NFTCard",
        "matchScore": 98,
        "matchReasons": [
          "Detected card pattern",
          "Contains image",
          "Has countdown timer",
          "Has price/bid information"
        ],
        "import": "import { NFTCard } from '@/components/nft-card/NFTCard';",
        "usage": "<NFTCard variant=\"Default\" price=\"0.45 ETH\" timeLeft=\"03:42\" verified />",
        "figmaNodeId": "121:6104"
      },
      {
        "component": "Button",
        "matchScore": 95,
        "matchReasons": [
          "Detected button pattern in design",
          "Has gradient (CTA variant)",
          "Has glass morphism (Neutral variant)"
        ],
        "import": "import { Button } from '@/components/button/Button';",
        "usage": "<Button style=\"CTA\" size=\"M\">Example Text</Button>"
      }
    ]
  }
}
```

---

## 🎯 Use Cases

### Use Case 1: Analyze Full Page

**Goal:** Get component suggestions for entire page design

**Steps:**
1. Select page/frame in Figma Desktop
2. Call `get_design_context()` (no nodeId = uses selection)
3. Call `suggest_components_from_figma` with full TSX output

**When to Use:**
- Building new page from scratch
- Understanding component composition
- Getting complete implementation guide

---

### Use Case 2: Analyze Specific Component

**Goal:** Identify which component matches a single Figma element

**Steps:**
1. Find node ID from Figma (right-click → Copy link → extract ID)
2. Call `get_design_context(nodeId: "123:456")`
3. Call `suggest_components_from_figma` with TSX

**When to Use:**
- Implementing specific UI element
- Verifying component match
- Quick component lookup

---

### Use Case 3: Quick Pattern Check (Metadata Only)

**Goal:** Fast pattern matching without full code

**Steps:**
1. Call `get_metadata(nodeId: "123:456")` → XML structure
2. Call `suggest_components_from_figma` with metadata only

**When to Use:**
- Quick component identification
- Large/complex designs (avoid TSX overhead)
- Just need component names, not implementation

---

## 🔧 Tool Parameters

### `suggest_components_from_figma`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `designContext` | string | No* | TSX code from `get_design_context` |
| `metadata` | string | No* | XML structure from `get_metadata` |
| `variables` | string | No* | JSON tokens from `get_variable_defs` |
| `screenshot` | string | No | Base64 or URL from `get_screenshot` |
| `nodeId` | string | No | Reference only (not used for fetching) |

**\*At least one of: `designContext`, `metadata`, or `variables` is required**

---

## 📊 Match Score Guide

| Score | Meaning | Action |
|-------|---------|--------|
| 95-100 | Excellent match | Use this component as-is |
| 85-94 | Good match | Use with minor prop adjustments |
| 70-84 | Moderate match | Review carefully, may need customization |
| <70 | Low match | Consider building custom component |

---

## 🛠️ Troubleshooting

### Issue: "At least one input must be provided"

**Cause:** No parameters passed to `suggest_components_from_figma`

**Solution:** 
1. First call Figma MCP tools
2. Copy output
3. Paste into SkullCandy MCP parameters

---

### Issue: "Failed to analyze Figma output"

**Cause:** Invalid input format

**Solution:**
- Ensure TSX code is complete string (not truncated)
- Verify JSON is valid (for variables)
- Check XML is well-formed (for metadata)

---

### Issue: Suggestions are inaccurate

**Cause:** Insufficient context

**Solution:**
- Provide both `designContext` AND `metadata` for better matching
- Include `variables` to detect design tokens
- Use more specific Figma node (not full page if analyzing single component)

---

## 💡 Pro Tips

### Tip 1: Combine Multiple Inputs for Best Results

```json
{
  "designContext": "<full TSX code>",
  "metadata": "<XML structure>",
  "variables": "<design tokens>"
}
```

This gives the most accurate suggestions by analyzing:
- Code patterns (TSX)
- Node structure (XML)
- Design tokens (JSON)

---

### Tip 2: Use Keyboard Shortcuts

**Create in VS Code keybindings.json:**
```json
[
  {
    "key": "cmd+shift+k f",
    "command": "workbench.action.chat.sendToNewChat",
    "args": "/mcp.figma-mcp-ser.get_design_context"
  },
  {
    "key": "cmd+shift+k s",
    "command": "workbench.action.chat.sendToNewChat",
    "args": "/mcp.skullcandy-mcp-server.suggest_components_from_figma"
  }
]
```

---

### Tip 3: Save Outputs for Documentation

Store Figma outputs in project for reference:

```
docs/figma-outputs/
├── page-hero-context.tsx
├── page-hero-metadata.xml
└── page-hero-variables.json
```

Then reference in components:
```tsx
/**
 * @figma-node 121:6096
 * @figma-context docs/figma-outputs/page-hero-context.tsx
 */
export function HeroSection() { ... }
```

---

## 📚 Related Documentation

- [Figma MCP Integration Rules](../instructions/figma-mcp.instructions.md)
- [Component Patterns](../instructions/component-patterns.instructions.md)
- [MCP Quick Reference](./MCP_QUICK_REFERENCE.md)

---

## 🔄 Workflow Comparison

### ❌ Old Strategy (MCP-to-MCP)

```
User → SkullCandy MCP → Figma MCP → Response
                ↓
          Bad Request Error
```

**Problems:**
- Initialization protocol mismatch
- JSON-RPC format issues
- Hard to debug

---

### ✅ New Strategy (Two-Step)

```
User → Figma MCP → TSX/JSON/XML Output
         ↓
User → SkullCandy MCP → Component Suggestions
```

**Benefits:**
- No MCP-to-MCP communication
- User controls data flow
- Easy to debug (see outputs)
- More flexible (can use any combination of inputs)

---

## 🎓 Example Session

**User opens Figma, selects NFT marketplace page**

```bash
# Step 1: Get design context
/mcp.figma-mcp-ser.get_design_context

# Output: <47KB of TSX code>

# Step 2: Analyze (paste TSX into parameter)
/mcp.skullcandy-mcp-server.suggest_components_from_figma
designContext: "<paste TSX here>"

# Output: 8 component suggestions
# - NFTCard (98%)
# - Button (95%)
# - SearchBar (92%)
# - Navbar (94%)
# - Cart (93%)
# - SectionHeading (90%)
# - NFTGrid (90%)
# - HeroSection (85%)
```

**User implements page using suggested components** ✅

---

**Last Updated:** 2025-11-01  
**Version:** 0.2.0
