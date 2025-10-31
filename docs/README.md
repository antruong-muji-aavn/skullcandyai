# SkullCandy Documentation

> **Project**: SkullCandy NFT Marketplace Design System  
> **Last Updated**: October 22, 2025

---

## 📚 Documentation Structure

### 📦 [Components](./components/)
Component specifications with exact Figma measurements, variants, and implementation details.

- [Button](./components/Button.md) - CTA/Neutral/Stroke variants (L/M/S)
- [NFTCard](./components/NFTCard.md) - Product card with image, badge, timer
- [SearchBar](./components/SearchBar.md) - Glass morphism search input
- [Navbar](./components/Navbar.md) - Sticky navigation with blur effect
- [Cart](./components/Cart.md) - Shopping cart interface
- [SectionHeading](./components/SectionHeading.md) - Title + description blocks
- [NFTGrid](./components/NFTGrid.md) - Grid layout for products
- [HeroSection](./components/HeroSection.md) - Landing page hero
- [_template-component.md](./components/_template-component.md) - Template for new components

### 🗺️ [Mapping](./mapping/)
Figma-to-code translation documentation for each component.

- [button.md](./mapping/button.md) - Figma node structure → React props
- [nft-card.md](./mapping/nft-card.md) - Product card mapping
- [search-bar.md](./mapping/search-bar.md) - Search input mapping
- [navbar.md](./mapping/navbar.md) - Navigation mapping
- [cart.md](./mapping/cart.md) - Cart mapping
- [section-heading.md](./mapping/section-heading.md) - Heading mapping
- [nft-grid.md](./mapping/nft-grid.md) - Grid layout mapping
- [hero-section.md](./mapping/hero-section.md) - Hero section mapping
- [_template-mapping.md](./mapping/_template-mapping.md) - Template for new mappings

### 🔌 [API](./api/)
Backend and external API documentation.

- [backend-api.md](./api/backend-api.md) - Product database API
- [cloudinary-api.md](./api/cloudinary-api.md) - CDN asset management
- [figma-mcp.md](./api/figma-mcp.md) - Figma MCP server integration
- [database-schema.md](./api/database-schema.md) - Database structure

### ⚙️ [Setup](./setup/)
MCP server and development environment setup.

- [MCP_UNIFIED_SERVER.md](./setup/MCP_UNIFIED_SERVER.md) - **START HERE** - Single-server setup
- [MCP_QUICK_REFERENCE.md](./setup/MCP_QUICK_REFERENCE.md) - Quick command reference
- [MCP_VSCODE_SETUP.md](./setup/MCP_VSCODE_SETUP.md) - VS Code configuration
- [MCP_HTTP_VS_STDIO.md](./setup/MCP_HTTP_VS_STDIO.md) - Protocol comparison
- [MCP_SERVER_COMPLETE.md](./setup/MCP_SERVER_COMPLETE.md) - Full implementation details

### 📝 [Changelogs](./changelogs/)
Component implementation and update logs.

- [HERO_SECTION_COMPLETE.md](./changelogs/HERO_SECTION_COMPLETE.md)
- [NAVBAR_BLUR_STICKY_UPDATE.md](./changelogs/NAVBAR_BLUR_STICKY_UPDATE.md)
- [NAVBAR_STICKY_FIX.md](./changelogs/NAVBAR_STICKY_FIX.md)
- [FEATURED_SECTION_3D_COMPLETE.md](./changelogs/FEATURED_SECTION_3D_COMPLETE.md)
- [FEATURED_SECTION_GRADIENT_BORDERS_UPDATE.md](./changelogs/FEATURED_SECTION_GRADIENT_BORDERS_UPDATE.md)
- [COMPLETE_PRODUCT_SYNC.md](./changelogs/COMPLETE_PRODUCT_SYNC.md)
- [PRODUCT_DATA_SYNC_COMPLETE.md](./changelogs/PRODUCT_DATA_SYNC_COMPLETE.md)
- [PRODUCT_SYNC_STATUS.md](./changelogs/PRODUCT_SYNC_STATUS.md)

### 📄 [Pages](./pages/)
Page-level documentation and planning.

- [LANDING_PAGE_PLAN.md](./pages/LANDING_PAGE_PLAN.md) - Homepage structure

### 📋 [Instructions](./instructions/)
Development workflow and agent instructions.

- [AGENT_PROMPT_MANUAL.md](./instructions/AGENT_PROMPT_MANUAL.md) - AI agent guidelines

---

## 🚀 Quick Start

### For Developers

1. **Read Setup Guide**: [MCP_UNIFIED_SERVER.md](./setup/MCP_UNIFIED_SERVER.md)
2. **Start MCP Server**: `pnpm run mcp`
3. **Browse Components**: Check [components/](./components/) for specs
4. **Check Mappings**: Review [mapping/](./mapping/) for Figma translation

### For Designers

1. **Component Specs**: See [components/](./components/) for exact measurements
2. **Figma Integration**: [figma-mcp.md](./api/figma-mcp.md) explains the sync process
3. **Asset Management**: [cloudinary-api.md](./api/cloudinary-api.md) for CDN uploads

### For AI Agents

1. **Component Patterns**: Read [component-patterns.instructions.md](../.github/instructions/component-patterns.instructions.md)
2. **Figma MCP Rules**: Read [figma-mcp.instructions.md](../.github/instructions/figma-mcp.instructions.md)
3. **MCP Tools**: Use `list_components`, `get_component_context`, `list_tokens`, `compare_variants`, `suggest_components_from_figma`

---

## 📊 Documentation Standards

All documentation follows these principles:

- **Token-efficient**: Tables > paragraphs, bullets > sentences
- **Exact values**: Numbers, not descriptions (16px not "medium")
- **Code examples**: Show, don't tell
- **Cross-referenced**: Links to related docs
- **Version tracked**: Last updated dates

See [documentation-standards.instructions.md](../.github/instructions/documentation-standards.instructions.md) for full guidelines.

---

## 🔗 Related Resources

- **Main README**: [../README.md](../README.md)
- **Scripts**: [../scripts/README.md](../scripts/README.md)
- **GitHub Instructions**: [../.github/copilot-instructions.md](../.github/copilot-instructions.md)
- **Design System Config**: [../.designrc.json](../.designrc.json)

---

**Maintained By**: GitHub Copilot Agent  
**Status**: ✅ Production Ready
