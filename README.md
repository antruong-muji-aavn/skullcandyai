# 💀 SkullCandy NFT Marketplace

A modern, production-ready NFT marketplace built with Next.js 14, featuring glass morphism design, real-time countdowns, and a comprehensive component library. Powered by Figma MCP for pixel-perfect design-to-code translation.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Storybook](https://img.shields.io/badge/Storybook-8.6.14-ff4785?style=flat&logo=storybook)](https://storybook.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.18-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

- 🎨 **Glass Morphism Design** - Modern UI with backdrop blur effects and gradient borders
- 🔥 **10 Complete Components** - Button, NFTCard, SearchBar, Navbar, Cart, Snackbar, and more
- 📱 **Fully Responsive** - Mobile-first design with breakpoints
- ⚡ **70+ Storybook Stories** - Comprehensive component documentation and testing
- 🎯 **Figma Integration** - Pixel-perfect implementation via Figma MCP
- 🧪 **Type-Safe** - Full TypeScript coverage with strict mode
- 🚀 **Performance Optimized** - Next.js 14 App Router with optimized images
- ♿ **Accessible** - WCAG AA compliant with ARIA support
- 🛒 **Shopping Cart** - Unlimited items, remove buttons, duplicate prevention
- 🔔 **Toast Notifications** - Snackbar system with auto-dismiss and type-based colors

## 🎯 Project Overview

SkullCandy is a next-generation NFT marketplace showcasing:

- **Design System Integration** - Complete design token system with CSS variables
- **Component Library** - Reusable, composable components with variants
- **Real-time Features** - Live countdown timers for NFT auctions
- **Search & Filtering** - Advanced search with live updates
- **Shopping Cart** - Unlimited items, hover-reveal remove buttons, duplicate detection
- **Toast Notifications** - Snackbar system for user feedback (success, warning, info, error)
- **3D Transforms** - Engaging hero section with depth effects
- **MCP Server** - Unified design system server on port 3001 (MCP + REST API)

## 📦 Tech Stack

- **Framework**: Next.js 14.2.15 (App Router)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 3.4.18 + CSS Variables (130+ design tokens)
- **Components**: Radix UI primitives for accessibility
- **Variant Management**: class-variance-authority (CVA)
- **Storybook**: v8.6.14 with Vite builder
- **Testing**: Vitest 2.1.9 + React Testing Library
- **Package Manager**: pnpm 10.18.2
- **Design Integration**: Figma MCP for design synchronization

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **pnpm** 10.18.2 or higher (install globally: `npm install -g pnpm`)

### Installation

```bash
# Clone the repository
git clone https://github.com/antruong-muji-aavn/skullcandyai.git
cd skullcandyai

# Install dependencies
pnpm install

# Start development server
pnpm dev
# Open http://localhost:3000

# Or start Storybook
pnpm sb
# Open http://localhost:6006
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Next.js development server (port 3000) |
| `pnpm build` | Build production bundle |
| `pnpm start` | Start production server |
| `pnpm sb` | Start Storybook (port 6006) |
| `pnpm sb:build` | Build Storybook for production |
| `pnpm mcp` | Start unified MCP server (port 3001) |
| `pnpm mcp:test` | Test all MCP endpoints |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run all tests with Vitest |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm check` | Run lint + test validation |

## 📁 Project Structure

```
skullcandyai/
├── .github/                   # GitHub configuration
│   ├── copilot-instructions.md           # AI agent instructions
│   └── instructions/                     # Component patterns, Figma MCP rules
├── .storybook/                # Storybook configuration
│   ├── main.ts               # Vite config with Next.js Image mock
│   └── preview.tsx           # Global decorators and parameters
├── docs/                      # Documentation
│   ├── components/           # Component specifications (18 sections each)
│   │   ├── Button.md         # Button component spec
│   │   ├── NFTCard.md        # NFT Card with countdown & verification
│   │   ├── SearchBar.md      # Glass morphism search
│   │   ├── Navbar.md         # Sticky navbar with blur
│   │   ├── Cart.md           # Shopping cart
│   │   ├── HeroSection.md    # Hero with 3D transforms
│   │   └── ...               # SectionHeading, NFTGrid, Footer
│   ├── mapping/              # Figma-to-code mappings (8 sections each)
│   │   ├── button.md         # Figma node → Button component
│   │   ├── nft-card.md       # NFTCard mapping with variants
│   │   └── ...               # All component mappings
│   ├── changelogs/           # Component update logs
│   │   ├── HERO_SECTION_COMPLETE.md
│   │   ├── FEATURED_SECTION_3D_COMPLETE.md
│   │   └── ...               # All component updates
│   ├── setup/                # MCP server setup guides
│   │   ├── MCP_UNIFIED_SERVER.md
│   │   └── MCP_QUICK_REFERENCE.md
│   └── api/                  # API documentation
│       ├── figma-mcp.md      # Figma MCP integration guide
│       └── backend-api.md    # Backend API specs
├── public/                    # Static assets
│   ├── assets/products/      # 48 product images (product-100 to product-147)
│   ├── images/               # Hero graphics, avatars, badges
│   └── ethereum-icon.svg     # Ethereum currency icon
├── scripts/                   # Utility scripts
│   ├── download-assets.js    # Download Figma assets
│   └── sync-entity-data.js   # Sync with backend
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout (Orbitron + Outfit fonts)
│   │   ├── page.tsx          # Landing page
│   │   └── HomeClient.tsx    # Client-side home page
│   ├── components/           # React components (10 total)
│   │   ├── button/           # CTA, Neutral, Stroke variants (L/M/S)
│   │   ├── nft-card/         # NFT card with countdown & verification
│   │   ├── search-bar/       # Glass morphism search (M/L sizes)
│   │   ├── section-heading/  # Title + description (center/left)
│   │   ├── nft-grid/         # Grid with search & filtering
│   │   ├── navbar/           # Sticky navbar with cart badge
│   │   ├── hero-section/     # Hero with 3D card transform
│   │   ├── cart/             # Shopping cart with unlimited items & remove
│   │   ├── snackbar/         # Toast notifications with auto-dismiss
│   │   └── footer/           # Footer with social links
│   ├── styles/               # Global styles and tokens
│   │   ├── tokens.css        # 130+ design tokens
│   │   └── globals.css       # Tailwind base + utilities
│   ├── lib/                  # Utilities
│   │   ├── mockData.ts       # Sample NFT data
│   │   └── types.ts          # TypeScript types
│   └── test/                 # Test configuration
│       └── setup.ts          # Vitest + jest-dom setup
├── .designrc.json            # Project config & Figma links
├── package.json              # Dependencies and scripts
├── tailwind.config.ts        # Tailwind with design tokens
├── vitest.config.ts          # Vitest test configuration
└── next.config.mjs           # Next.js configuration
```

## 🎨 Components

### Available Components

| Component | Variants | Description |
|-----------|----------|-------------|
| **Button** | CTA, Neutral, Stroke × L/M/S | Glass morphism buttons with gradient backgrounds |
| **NFTCard** | Default, Unverified, NoCountdown | NFT display with countdown, price, and verification badge |
| **SearchBar** | M, L sizes | Glass search input with live filtering |
| **SectionHeading** | Center, Left | Title + description with alignment options |
| **NFTGrid** | With/without search | Responsive grid layout for NFT cards |
| **Navbar** | Sticky, transparent | Navigation with cart badge and blur effect |
| **HeroSection** | With featured card | Landing hero with 3D transform effects |
| **Cart** | Open/closed | Shopping cart with unlimited items, remove buttons, duplicate detection |
| **Snackbar** | Info, Success, Warning, Error | Toast notifications with auto-dismiss and manual close |
| **Footer** | Social links | Footer with navigation and social icons |

### Design System

**130+ Design Tokens** defined in `src/styles/tokens.css`:

```css
:root {
  /* Typography */
  --font-family-title: 'Orbitron', sans-serif;
  --font-family-body: 'Outfit', sans-serif;
  
  /* Colors */
  --glass-light: #ffffff1a;
  --glass-dark: #0000001a;
  --glass-border: #ffffffe5;
  
  /* Effects */
  --glass-blur: 100px;        /* Figma 200 → CSS 100px */
  --button-gradient: linear-gradient(273deg, rgba(1,166,255,0.70)...);
  --gradient-border-main: linear-gradient(180deg, rgba(255,255,255,0.90)...);
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

### Tailwind Integration

All tokens are mapped to Tailwind utilities:

```tsx
// ✅ Use semantic classes
<div className="font-family-title bg-glass-light backdrop-blur-glass">
  <h1 className="text-[38px] font-bold">Discover NFTs</h1>
</div>

// ❌ Never hardcode
<div style={{ background: '#ffffff1a', backdropFilter: 'blur(100px)' }}>
```

## 🧩 Component Development Workflow

### Adding/Updating Components

**5-Step Process:**

1. **Read Specs** - Extract from Figma via MCP: `get_design_context(nodeId)`
2. **Implement** - Create component in `src/components/<kebab>/`
3. **Map** - Document Figma-to-code mapping in `docs/mapping/`
4. **Test** - Validate pixel-perfect match with Figma screenshot
5. **Update Docs** - Sync `docs/components/` with implementation

### Button Component Example

```tsx
// src/components/button/Button.tsx
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'font-family-button font-bold text-white transition-all',
  {
    variants: {
      style: {
        CTA: 'backdrop-blur-glass [background:var(--button-gradient)]',
        Neutral: 'backdrop-blur-glass bg-glass-light glass-border-gradient',
        Stroke: 'bg-transparent border border-solid border-white/90',
      },
      size: {
        L: 'text-[24px] px-[80px] py-[18px] rounded-full',
        M: 'text-[18px] px-[32px] py-[12px] rounded-full',
        S: 'text-[14px] px-[16px] py-[12px] rounded-full',
      },
    },
    defaultVariants: {
      style: 'CTA',
      size: 'M',
    },
  }
);

export function Button({ style, size, ...props }) {
  return <button className={buttonVariants({ style, size })} {...props} />;
}
```

**Documentation:**
- Spec: `docs/components/Button.md` (18 sections)
- Mapping: `docs/mapping/button.md` (8 sections with Figma node IDs)
- Stories: 9 variants in `Button.stories.tsx`
- Tests: `Button.test.tsx` with render, interaction, a11y

## 🔍 Figma MCP Integration

### Design-to-Code Workflow

This project uses **Figma MCP** for pixel-perfect design implementation:

**MCP Tools Available:**
- `get_design_context(nodeId)` - Extract component code + tokens
- `get_variable_defs(nodeId)` - Get design variables (colors, fonts, spacing)
- `get_screenshot(nodeId)` - Visual reference for validation
- `get_metadata(nodeId)` - Node structure overview

**Project Configuration** (`.designrc.json`):

```json
{
  "projectName": "SkullCandy",
  "organization": "ePost",
  "designSystem": "DevDaySkullCandy",
  "figma": {
    "fileUrl": "https://www.figma.com/design/V8UvDvpedWuc7biBBVPi7C/SkullCandy",
    "rootNodeId": "0:1"
  }
}
```

### Critical Rules

**✅ DO:**
- Use semantic token classes (`bg-glass-light`, `font-family-title`)
- Reuse existing components (composition over duplication)
- Match Figma exactly (use `text-[24px]`, `px-[80px]` for exact values)
- Convert blur values (Figma 200 → CSS 100px, divide by 2)
- Use gradient borders for glass morphism (`glass-border-gradient`)

**❌ DON'T:**
- Hardcode colors, fonts, spacing
- Create duplicate components
- Use Figma blur values directly
- Skip documentation (both spec + mapping required)

### 🆕 Figma Component Suggestion Feature

**NEW:** Automatically suggest matching components from your design system based on Figma selection!

**How it works:**
1. Select a frame/component in Figma Desktop
2. Call `suggest_components_from_figma` tool
3. Get top 5 suggested components with match scores and usage examples

**Example:**
```typescript
// Select a button in Figma, then call:
mcp_skullcandy_mc_suggest_components_from_figma()

// Returns:
{
  "suggestions": [
    {
      "component": "Button",
      "matchScore": 90,
      "matchReasons": ["Node name contains 'button'", "Has text content"],
      "usage": "<Button style=\"CTA\" size=\"M\">Buy Now</Button>"
    }
  ]
}
```

**Matching Features:**
- Pattern matching on node names (button, card, input, nav)
- Content analysis (text, images, interactive elements)
- Score-based ranking (0-100)
- Contextual code examples using actual Figma content

📖 **Full documentation:** [docs/features/FIGMA_INTEGRATION.md](docs/features/FIGMA_INTEGRATION.md)

## 📚 Storybook

### Component Stories

**70+ stories** covering all component variants:

```bash
# Start Storybook
pnpm sb
# Open http://localhost:6006
```

**Story Coverage:**
- **Button**: 9 stories (3 styles × 3 sizes)
- **NFTCard**: 10 stories (variants, edge cases, playground)
- **SearchBar**: 6 stories (sizes, states, interactions)
- **SectionHeading**: 7 stories (alignments, content variations)
- **NFTGrid**: 8 stories (with/without search, layouts)
- **Navbar**: 5 stories (states, cart badge, responsive)
- **HeroSection**: 7 stories (featured cards, backgrounds)
- **Cart**: 6 stories (empty, with items, remove interactions)
- **Snackbar**: 4 stories (info, success, warning, error types)
- **Footer**: 7 stories (layouts, social links)

**Features:**
- ✅ All stories use **local images** (48 product images in `public/assets/products/`)
- ✅ Next.js Image compatibility (mocked for Storybook)
- ✅ Hot Module Reload (HMR) working
- ✅ React imports fixed (no "React is not defined" errors)
- ✅ No external dependencies (Cloudinary URLs replaced with local paths)

## 🧪 Testing

Tests written with **Vitest** and **React Testing Library**:

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Run linting
pnpm lint

# Run full check (lint + test)
pnpm check
```

**Test Coverage:**
- Component rendering
- User interactions
- Accessibility (ARIA, keyboard navigation)
- Edge cases and error states

## 📚 Documentation

### Component Documentation System

Each component has **two documentation files**:

**1. Component Spec** (`docs/components/<Component>.md`) - 18 sections:
- Overview, Specs, Variants, Typography, Colors, Spacing, Effects
- Layout, Responsive, States, Accessibility, Props API
- Usage, Examples, Edge Cases, References

**2. Figma Mapping** (`docs/mapping/<component>.md`) - 8 sections:
- Node Structure, Property Mapping, Token Extraction, Auto Layout
- Variants, Assets, Implementation Notes, Update Log

### AI Agent Instructions

**`.github/copilot-instructions.md`** - Main instructions for AI agents
**`.github/instructions/`**:
- `component-patterns.instructions.md` - Component development patterns
- `figma-mcp.instructions.md` - Figma MCP integration workflow
- `documentation-standards.instructions.md` - Documentation guidelines

## 🎯 Development Guidelines

### Code Quality Rules

1. ✅ **Use semantic tokens** - `bg-glass-light` not `bg-[#ffffff1a]`
2. ✅ **Compose components** - Reuse existing, don't duplicate
3. ✅ **Match Figma exactly** - Use exact pixel values when needed
4. ✅ **Document everything** - Both spec + mapping required
5. ✅ **Test thoroughly** - Unit, integration, accessibility tests
6. ❌ **Never hardcode** - Colors, fonts, spacing must use tokens
7. ❌ **No inline styles** - Use Tailwind utilities or tokens

### Accessibility Standards

- ✅ WCAG AA compliant
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast ratios
- ✅ Focus indicators

## 🚀 Deployment

### Build for Production

```bash
# Build Next.js app
pnpm build

# Start production server
pnpm start

# Build Storybook
pnpm sb:build
# Output in storybook-static/
```

### Environment Variables

Create `.env.local` for local development:

```env
# Optional: Backend API URL
NEXT_PUBLIC_API_URL=https://your-api.com

# Optional: Cloudinary config (if using CDN)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## 🚧 Project Status

### ✅ Completed (100%)

- [x] Next.js 14 + TypeScript + React 18 setup
- [x] Tailwind CSS with 130+ design tokens
- [x] 10 fully implemented components (including Snackbar)
- [x] 74+ Storybook stories (all working)
- [x] Figma MCP integration
- [x] Complete documentation system
- [x] Component specs (18 sections each)
- [x] Figma mappings (8 sections each)
- [x] Local asset integration (48 product images)
- [x] Storybook fixes (Next.js Image, React imports, local images)
- [x] Glass morphism design system
- [x] Gradient borders and backdrop blur
- [x] Responsive design (mobile-first)
- [x] Accessibility (WCAG AA)
- [x] Shopping cart enhancements (unlimited items, remove, duplicate detection)
- [x] Toast notification system (Snackbar with auto-dismiss)
- [x] MCP unified server (port 3001, MCP + REST API)
- [x] Documentation reorganization (changelogs, setup guides)

### 🎯 Ready for Development

The project is **production-ready** with:
- ✅ Component library complete
- ✅ Design system implemented
- ✅ Storybook documentation
- ✅ Testing infrastructure
- ✅ CI/CD ready

## 🤝 Contributing

### Contribution Workflow

1. **Fork & Clone** the repository
2. **Create a feature branch**: `git checkout -b feature/new-component`
3. **Follow the 5-step workflow**:
   - Read Figma specs via MCP
   - Implement component with CVA
   - Document in both spec + mapping files
   - Create Storybook stories
   - Write tests
4. **Run checks**: `pnpm check` (lint + test)
5. **Commit with clear message**: `git commit -m "feat: add NewComponent"`
6. **Push and create PR**: `git push origin feature/new-component`

### Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (auto-format on save)
- **Linting**: ESLint with zero warnings
- **Naming**: PascalCase for components, kebab-case for folders
- **Tokens**: Always use semantic classes from design system
- **Tests**: Required for all new components
- **Docs**: Both spec + mapping files required

## 📖 Resources

### Links

- **Repository**: https://github.com/antruong-muji-aavn/skullcandyai
- **Figma Design**: [SkullCandy Design File](https://www.figma.com/design/V8UvDvpedWuc7biBBVPi7C/SkullCandy)
- **Storybook**: Run `pnpm sb` → http://localhost:6006
- **Next.js App**: Run `pnpm dev` → http://localhost:3000

### Documentation

- Component Specs: `docs/components/`
- Figma Mappings: `docs/mapping/`
- API Docs: `docs/api/`
- Agent Instructions: `.github/copilot-instructions.md`

## 📄 License

MIT License - See LICENSE file for details.

---

## 🙏 Acknowledgments

- **Design**: SkullCandy design system by ePost
- **Framework**: Next.js by Vercel
- **Styling**: Tailwind CSS
- **Components**: Radix UI primitives
- **Integration**: Figma MCP for design-to-code

---

**Built with 💀 for the next generation of NFT marketplaces**

*Powered by Next.js 14 | TypeScript | Tailwind CSS | Figma MCP*
