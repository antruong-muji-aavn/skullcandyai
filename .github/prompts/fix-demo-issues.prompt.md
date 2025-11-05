---
mode: 'agent'
model: 'Claude Sonnet 4.5'
tools: ['runCommands', 'runTasks', 'edit', 'runNotebooks', 'search', 'new', 'figma-mcp-server/*', 'skullcandy-mcp/*', 'extensions', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'todos']
description: 'Transform demo with wrong layout/missing features → Production-ready implementation'
---

# Fix Demo Issues - Live AI Agent Implementation

> **Purpose**: Step-by-step instructions to fix intentionally broken demo setup  
> **MCP Servers**: Figma MCP Server + SkullCandy MCP Server  
> **Target**: Transform demo with wrong layout/missing features → Production-ready implementation

---

## 📋 Prerequisites

**Verify Figma Frame Selected**: "Monthly Collection" (Node ID: 121:6097)

**Required MCP Servers**:
1. **Figma MCP Server** - Design context extraction
2. **SkullCandy MCP Server** - Component validation and tokens

**Backend API Endpoint**: `https://devday-aavn-d5284e914439.herokuapp.com/api/products`

---

## ⚠️ CRITICAL: MANDATORY MCP TOOL USAGE

**YOU MUST CALL THESE SKULLCANDY MCP TOOLS - NO EXCEPTIONS:**

1. **BEFORE fixing layout** → `mcp_skullcandy-mc_extract_layout` (Phase 1.3)
2. **BEFORE fixing layout** → `mcp_skullcandy-mc_list_tokens` (Phase 2.2)
3. **AFTER fixing layout** → `mcp_skullcandy-mc_validate_token_usage` (Phase 2.3)
4. **BEFORE search implementation** → `mcp_skullcandy-mc_get_component_context` (Phase 3.1)


**FAILURE TO CALL THESE TOOLS = INCOMPLETE IMPLEMENTATION**

The SkullCandy MCP server provides deterministic validation that ensures:
- ✅ Correct design token usage (no hardcoded values)
- ✅ Layout matches Figma exactly (no guessing)
- ✅ Component API correctness
- ✅ Design system parity

**DO NOT SKIP** - These tools are the source of truth for validation.

---

## Phase 1: Validate Figma Design Context

### Step 1.1: Extract Design Specifications

```bash
# Use Figma MCP to get exact measurements
mcp_figma-mcp-ser_get_design_context(
  nodeId="121:6097",
  clientLanguages="typescript",
  clientFrameworks="react"
)
```

**Extract from response**:
- Container padding values
- Gap spacing (itemSpacing)
- Layout mode (HORIZONTAL/VERTICAL)
- Search field dimensions

### Step 1.2: Get Metadata Overview

```bash
# Get structural hierarchy
mcp_figma-mcp-ser_get_metadata(
  nodeId="121:6097",
  clientLanguages="typescript",
  clientFrameworks="react"
)
```

**Look for**:
- Node 121:6103 ("Product List")
- `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`
- `itemSpacing` value (CRITICAL: This is the gap!)
- `layoutWrap: WRAP`

### Step 1.3: Extract Layout Intent ⚠️ MANDATORY

```bash
# ⚠️ REQUIRED: Use SkullCandy MCP to parse layout structure
mcp_skullcandy-mc_extract_layout(
  figma_node={
    "paddingBottom": 64,
    "paddingLeft": 32,
    "paddingRight": 32,
    "paddingTop": 64,
    "itemSpacing": 24,
    "layoutMode": "HORIZONTAL",
    "layoutWrap": "WRAP"
  }
)
```

**Expected Output**:
```json
{
  "display": "flex",
  "direction": "row",
  "gap": 24,
  "wrap": true
}
```

**❌ DO NOT PROCEED TO PHASE 2 WITHOUT CALLING THIS TOOL**

---

## Phase 2: Fix Layout Gaps

### Step 2.0: ⚠️ Understand the Problem - Wrong Gap Values

**The Core Issue**: Demo uses WRONG gap values that don't match Figma metadata.

**From Figma Analysis (Phase 1)**:
- Check `itemSpacing` value from Figma metadata (horizontal gap between cards)
- Check vertical row spacing from Figma (may be different from horizontal)
- Figma `layoutMode: HORIZONTAL` with `layoutWrap: WRAP` = flex-wrap layout
- **CRITICAL**: Horizontal and vertical spacing may NOT be equal - check Figma metadata

**Current Demo Problem**:
- ❌ Horizontal gap: 8px (`gap-x-2`) - TOO SMALL
- ❌ Vertical gap: 40px (`gap-y-10`) - MAY BE WRONG (check Figma)
- ❌ Result: Cramped horizontally, needs verification against actual Figma values

**Correct Implementation Should Be** (verify from Figma metadata):
- ✅ Horizontal gap: 24px (`gap-x-6`) - from `itemSpacing: 24`
- ✅ Vertical gap: 96px (`gap-y-24`) - check Figma for actual row spacing
- ✅ Result: Matches Figma's exact horizontal and vertical spacing values

### Step 2.1: Read Current Implementation

```bash
# Read existing implementation
read_file("/Users/antruong/Work/Projects/SkullCandy2/src/components/nft-grid/NFTGrid.tsx")
```

**Identify Problem**:
```tsx
// CURRENT (WRONG):
const gapClasses = {
  md: 'gap-x-2 gap-y-10',   // 8px horizontal × 40px vertical - WRONG VALUES
};

// SHOULD BE (based on Figma metadata):
const gapClasses = {
  md: 'gap-x-6 gap-y-24',   // 24px horizontal × 96px vertical - from Figma
};
```

**Why This Matters**:
- Figma metadata shows **different** horizontal and vertical spacing
- Check `itemSpacing` for horizontal gap between cards
- Check row spacing (vertical) separately - may be different
- Must match Figma's exact layout intent, not assume uniform spacing

### Step 2.2: Verify Design Tokens ⚠️ MANDATORY

```bash
# ⚠️ REQUIRED: Get spacing tokens from SkullCandy MCP
mcp_skullcandy-mc_list_tokens(
  scope=["spacing"]
)
```

**Confirm**: `gap-6` = 24px (Tailwind convention)

**❌ DO NOT PROCEED WITHOUT CALLING THIS TOOL**

### Step 2.2.5: ⚠️ CRITICAL - Validate Horizontal AND Vertical Spacing

**IMPORTANT**: Check Figma metadata for **ACTUAL** horizontal and vertical values - they may be DIFFERENT.

**Verify BOTH axes carefully from Figma metadata**:

1. **Horizontal Spacing** (gap-x):
   - ❌ WRONG: `gap-x-2` (8px) 
   - ✅ CORRECT: `gap-x-6` (24px) - from Figma `itemSpacing: 24`
   - Source: Figma metadata field `itemSpacing`

2. **Vertical Spacing** (gap-y):
   - ❌ WRONG: `gap-y-10` (40px)
   - ✅ CORRECT: `gap-y-24` (96px) - check actual Figma row spacing
   - Source: Measure vertical distance between rows in Figma metadata

3. **Figma Validation**:
   - `itemSpacing` gives horizontal gap between cards
   - Vertical row spacing may be DIFFERENT - check Figma metadata carefully
   - Use Figma screenshot to visually verify but MEASURE from metadata
   - Check with SkullCandy MCP `extract_layout` output

**Red Flags to Watch For**:
- ⚠️ Assuming uniform spacing without checking Figma metadata
- ⚠️ Using single `gap-*` utility when Figma has different H/V values
- ⚠️ Hardcoded px values instead of design tokens
- ⚠️ Not matching Figma's exact horizontal AND vertical values

**Correct Implementation**:
```tsx
// ✅ CORRECT - Separate H/V spacing from Figma metadata
gap-x-6 gap-y-24  // 24px horizontal × 96px vertical - from Figma

// ❌ WRONG - Current demo values
gap-x-2 gap-y-10  // 8px horizontal, 40px vertical - INCORRECT

// ❌ ALSO WRONG - Assuming uniform when Figma shows different
gap-6  // Only use if Figma metadata confirms same H/V values
```

### Step 2.3: Fix Gap Classes

**File**: `src/components/nft-grid/NFTGrid.tsx`

**Change Required**:

```tsx
// OLD (Line ~15-19):
  const gapClasses = {
    sm: 'gap-x-4 gap-y-12',   // 16px × 48px
    md: 'gap-x-2 gap-y-10',   // 8px × 40px - WRONG VALUES FOR DEMO
    lg: 'gap-x-8 gap-y-32',   // 32px × 128px
  };

// NEW (based on Figma metadata):
  const gapClasses = {
    sm: 'gap-x-4 gap-y-12',    // Keep proportional
    md: 'gap-x-6 gap-y-24',    // 24px × 96px - FIXED from Figma metadata
    lg: 'gap-x-8 gap-y-32',    // Keep proportional
  };
```

**Validation** ⚠️ MANDATORY:
```bash
**Validation** ⚠️ MANDATORY:
```bash
# ⚠️ REQUIRED: Verify token usage
mcp_skullcandy-mc_validate_token_usage(
  filePaths=["src/components/nft-grid/NFTGrid.tsx"]
)
```

**❌ DO NOT PROCEED TO PHASE 3 WITHOUT THIS VALIDATION**

### Step 2.4: Final Spacing Verification

**Run this grep command to confirm the fix**:

```bash
grep_search(
  query="gap-",
  includePattern="src/components/nft-grid/NFTGrid.tsx",
  isRegexp=false
)
```

**Expected Output** (MUST see this):
```tsx
sm: 'gap-x-4 gap-y-12',    // 16px × 48px proportional
md: 'gap-x-6 gap-y-24',    // 24px × 96px - matches Figma metadata
lg: 'gap-x-8 gap-y-32',    // 32px × 128px proportional
```

**REJECT if you see** (these indicate failed fix):
```tsx
❌ 'gap-x-2 gap-y-10'   // Wrong demo values (8px × 40px)
❌ 'gap-6'              // Uniform gap (only if Figma confirms H=V)
❌ Any values that don't match Figma metadata exactly
```

**Double-check the container**:
```bash
grep_search(
  query="px-\\[32px\\] py-\\[64px\\]",
  includePattern="src/components/nft-grid/NFTGrid.tsx",
  isRegexp=true
)
```

**Expected**: Should find the container with correct padding values.

**If validation fails, DO NOT PROCEED - fix the code first!**

---
```

**Expected**: No hardcoded pixel values, uses Tailwind utilities ✓

**❌ DO NOT PROCEED TO PHASE 3 WITHOUT CALLING THIS TOOL**

---

## Phase 3: Enable Search Bar

### Step 3.1: Check SearchBar Component ⚠️ MANDATORY

```bash
# ⚠️ REQUIRED: Get component context
mcp_skullcandy-mc_get_component_context(name="SearchBar")
```

**Verify**:
- Component exists at `@/components/search-bar`
- Props: `placeholder`, `value`, `onChange`
- Size variants available

**❌ DO NOT PROCEED WITHOUT CALLING THIS TOOL**

### Step 3.2: Update SectionHeading Default

**File**: `src/components/section-heading/SectionHeading.tsx`

**Change Required**:

```tsx
// OLD (Line ~10-12):
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  // ...
  showSearch = false, // Default hidden for demo
}) => {

// NEW:
export const SectionHeading: React.FC<SectionHeadingProps> = ({
  // ...
  showSearch = true, // Enable search by default
}) => {
```

### Step 3.3: Add Search State in HomeClient

**File**: `src/app/HomeClient.tsx`

**Add after line 30 (after MOCK_PRODUCTS)**:

```tsx
export function HomeClient({ products = [] }: HomeClientProps) {
  // ADD THIS:
  const [searchQuery, setSearchQuery] = useState('');
  
  // Existing state...
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });
```

### Step 3.4: Add Search Handler

**File**: `src/app/HomeClient.tsx`

**Add after handleCloseSnackbar (around line 55)**:

```tsx
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, isOpen: false }));
  };

  // ADD THIS:
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
```

### Step 3.5: Implement Filtering Logic

**File**: `src/app/HomeClient.tsx`

**Add after handleSearchChange**:

```tsx
  // ADD THIS:
  // Filter products based on search query
  const displayProducts = products.filter((product) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      (product.tags && product.tags.some((tag: string) => tag.toLowerCase().includes(query)))
    );
  });
```

### Step 3.6: Update NFTGrid Props

**File**: `src/app/HomeClient.tsx`

**Change in JSX (around line 65)**:

```tsx
// OLD:
<NFTGrid
  title="MONTHLY SKULL CANDIES"
  description="Discover one of the most cutest NFT creations created for you. Place your bid and be the first to have these treasures. All of the artworks are limited selections."
  gap="md"
>

// NEW:
<NFTGrid
  title="MONTHLY SKULL CANDIES"
  description="Discover one of the most cutest NFT creations created for you. Place your bid and be the first to have these treasures. All of the artworks are limited selections."
  searchPlaceholder="Search by topics or collections"
  onSearchChange={handleSearchChange}
  gap="md"
>
```

### Step 3.7: Update Products Mapping

**File**: `src/app/HomeClient.tsx`

**Change in JSX (around line 70)**:

```tsx
// OLD:
{MOCK_PRODUCTS.map((product) => {

// NEW:
{displayProducts.map((product) => {
```

---

## Phase 4: Integrate Backend API

### Step 4.1: Update Server Component to Fetch Products

**File**: `src/app/page.tsx`

**Read current implementation**:

```bash
read_file("/Users/antruong/Work/Projects/SkullCandy2/src/app/page.tsx")
```

**Replace entire server component logic**:

```tsx
// OLD (entire file):
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { HomeClient } from './HomeClient';

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <HomeClient />
    </>
  );
}

// NEW (entire file):
import { Navbar } from '@/components/navbar';
import { HeroSection } from '@/components/hero-section';
import { HomeClient } from './HomeClient';

const API_URL = 'https://devday-aavn-d5284e914439.herokuapp.com/api/products';

export default async function Home() {
  // Fetch products from backend API
  let products = [];
  
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    });
    
    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }
    
    products = await res.json();
  } catch (error) {
    console.error('Failed to fetch products from backend:', error);
    // Fallback to empty array - component will handle gracefully
  }

  return (
    <>
      <Navbar />
      <HeroSection />
      <HomeClient products={products} />
    </>
  );
}
```

### Step 4.2: Update HomeClient to Accept Products Prop

**File**: `src/app/HomeClient.tsx`

**Update interface (line 4-6)**:

```tsx
// OLD:
interface HomeClientProps {
  products?: any[]; // Optional for future use
}

// NEW:
interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  author?: string;
  rating?: number;
  tags?: string[];
}

interface HomeClientProps {
  products: Product[];
}
```

### Step 4.3: Remove Mock Data Constant

**File**: `src/app/HomeClient.tsx`

**Delete lines 8-28**:

```tsx
// DELETE THIS ENTIRE BLOCK:
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "[DEMO] Mock Shoe NFT #001",
    image: "https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg",
    price: 1.25,
    rating: 4.5,
    tags: ["demo", "mock", "placeholder"]
  },
  {
    id: 2, 
    name: "[DEMO] Mock Shoe NFT #002",
    image: "https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg",
    price: 2.50,
    rating: 4.2,
    tags: ["demo", "mock", "placeholder"]
  },
  {
    id: 3,
    name: "[DEMO] Mock Shoe NFT #003", 
    image: "https://res.cloudinary.com/dtes5pcfm/image/upload/v1760925713/samples/shoe.jpg",
    price: 0.99,
    rating: 3.8,
    tags: ["demo", "mock", "placeholder"]
  }
];
```

### Step 4.4: Update Component Function Signature

**File**: `src/app/HomeClient.tsx`

**Change line ~32**:

```tsx
// OLD:
export function HomeClient(_props: HomeClientProps) {

// NEW:
export function HomeClient({ products }: HomeClientProps) {
```

### Step 4.5: Update Product Mapping

**File**: `src/app/HomeClient.tsx`

**In JSX, change NFTCard mapping logic (around line 72)**:

```tsx
// OLD:
{displayProducts.map((product) => {
  // Fixed countdown for demo
  const countdown = { hours: 2, minutes: 15, seconds: 30 };
  
  return (
    <NFTCardClient
      key={product.id}
      image={product.image}
      imageAlt={`${product.name} NFT artwork`}
      title={product.name}
      author="Demo Creator [MOCK]"
      verified={false}
      countdown={countdown}
      price={product.price.toFixed(2)}
      currency="ETH"
      currencyIcon="/ethereum-icon.svg"
      buttonText="Bid now"
      onButtonClick={() => handleBidNow(product)}
    />
  );
})}

// NEW:
{displayProducts.map((product) => {
  // Dynamic countdown based on product data or random for demo
  const countdown = { 
    hours: Math.floor(Math.random() * 8), 
    minutes: Math.floor(Math.random() * 60), 
    seconds: Math.floor(Math.random() * 60) 
  };
  
  return (
    <NFTCardClient
      key={product.id}
      image={product.image}
      imageAlt={`${product.name} NFT artwork`}
      title={product.name}
      author={product.author || "Unknown Creator"}
      verified={false}
      countdown={countdown}
      price={product.price.toFixed(2)}
      currency="ETH"
      currencyIcon="/ethereum-icon.svg"
      buttonText="Bid now"
      onButtonClick={() => handleBidNow(product)}
    />
  );
})}
```

---

## Phase 5: Implement Cart Functionality

### Step 5.1: Create Cart Context

**New File**: `src/contexts/CartContext.tsx`

```tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  cartId: number;
  id: number;
  name: string;
  image: string;
  price: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (cartId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    const cartItem = {
      ...product,
      cartId: Date.now(), // Unique ID for cart item
    };
    setCartItems((prev) => [...prev, cartItem]);
  };

  const removeFromCart = (cartId: number) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

### Step 5.2: Wrap App with CartProvider

**File**: `src/app/layout.tsx`

**Add import**:

```tsx
import { CartProvider } from '@/contexts/CartContext';
```

**Wrap children**:

```tsx
// Find the <body> tag and wrap its children:
<body>
  <CartProvider>
    {children}
  </CartProvider>
</body>
```

### Step 5.3: Update HomeClient to Use Cart

**File**: `src/app/HomeClient.tsx`

**Add import at top**:

```tsx
import { useCart } from '@/contexts/CartContext';
```

**Add cart hook (after line 48)**:

```tsx
export function HomeClient({ products }: HomeClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });
  
  // ADD THIS:
  const { cartItems, addToCart, removeFromCart } = useCart();
```

### Step 5.4: Update Bid Handler

**File**: `src/app/HomeClient.tsx`

**Replace handleBidNow function (around line 52)**:

```tsx
// OLD:
const handleBidNow = (product: typeof MOCK_PRODUCTS[0]) => {
  // Show demo message instead of adding to cart
  setSnackbar({
    isOpen: true,
    message: `[DEMO] Bidding on "${product.name}" - Cart feature will be implemented by AI agent later!`,
    type: 'info',
  });
};

// NEW:
const handleBidNow = (product: Product) => {
  addToCart(product);
  setSnackbar({
    isOpen: true,
    message: `Added "${product.name}" to cart!`,
    type: 'success',
  });
};
```

### Step 5.5: Add Remove from Cart Handler

**File**: `src/app/HomeClient.tsx`

**Add after handleBidNow**:

```tsx
const handleRemoveFromCart = (cartId: number) => {
  removeFromCart(cartId);
  setSnackbar({
    isOpen: true,
    message: 'Item removed from cart',
    type: 'info',
  });
};
```

### Step 5.6: Uncomment Cart Component

**File**: `src/app/HomeClient.tsx`

**Find comment around line 95 and uncomment**:

```tsx
// OLD:
{/* Cart Component - Removed for demo, will be implemented later */}
{/* <Cart items={cartItems} onRemoveItem={handleRemoveFromCart} /> */}

// NEW:
{/* Cart Component */}
<Cart items={cartItems} onRemoveItem={handleRemoveFromCart} />
```

**Add import at top**:

```tsx
import { Cart } from '@/components/cart';
```

---

## Phase 6: Validation & Testing

### Step 6.0: ⚠️ CRITICAL - Manual Spacing Verification

**BEFORE running automated validation, manually verify spacing in code:**

**File**: `src/components/nft-grid/NFTGrid.tsx`

**Check these exact values**:

```tsx
// ✅ CORRECT IMPLEMENTATION (based on Figma metadata):
const gapClasses = {
  md: 'gap-x-6 gap-y-24',   // 24px horizontal × 96px vertical - from Figma
};

// Container classes should have:
className={`
  flex
  flex-wrap
  px-[32px]      // Figma paddingLeft/Right: 32
  py-[64px]      // Figma paddingTop/Bottom: 64
  ${gapClasses[gap]}  // This should resolve to 'gap-x-6 gap-y-24'
`}
```

**Visual Inspection Checklist**:
- [ ] Gap classes are `gap-x-6 gap-y-24` (matches Figma metadata)
- [ ] Horizontal gap: 24px (from `itemSpacing: 24`)
- [ ] Vertical gap: 96px (from Figma row spacing)
- [ ] Container padding matches: `px-[32px] py-[64px]`
- [ ] Using separate gap-x and gap-y as per Figma design

**Read the file to confirm**:
```bash
grep_search(
  query="gap-",
  includePattern="src/components/nft-grid/NFTGrid.tsx",
  isRegexp=false
)
```

**Expected Output**:
```tsx
md: 'gap-x-6 gap-y-24',   // Should see 24px horizontal × 96px vertical from Figma
```

**Red Flags** (if you see these, FIX IMMEDIATELY):
- ❌ `gap-x-2 gap-y-10` (wrong demo values: 8px × 40px)
- ❌ `gap-6` only (assumes uniform spacing without checking Figma)
- ❌ Any values that don't match Figma metadata horizontal AND vertical measurements
- ❌ Hardcoded pixel values instead of Tailwind utilities

### Step 6.1: Validate Layout with SkullCandy MCP ⚠️ MANDATORY

```bash
# ⚠️ REQUIRED: Check if implementation matches Figma
mcp_skullcandy-mc_diff_figma_vs_code(
  component="NFTGrid",
  figma_node={
    "paddingBottom": 64,
    "paddingLeft": 32,
    "paddingRight": 32,
    "paddingTop": 64,
    "itemSpacing": 24
  }
)
```

**Expected**: No spacing differences ✓

**Specifically verify**:
- ✅ Horizontal gap: 24px (gap-x-6) - from Figma `itemSpacing: 24`
- ✅ Vertical gap: 96px (gap-y-24) - from Figma row spacing
- ✅ Container padding: 32px horizontal, 64px vertical
- ✅ Spacing matches Figma metadata exactly (H and V may differ)

**❌ THIS IS A CRITICAL VALIDATION - DO NOT SKIP**

### Step 6.2: Validate Token Usage ⚠️ MANDATORY

```bash
# ⚠️ REQUIRED: Ensure no hardcoded values
mcp_skullcandy-mc_validate_token_usage(
  filePaths=[
    "src/components/nft-grid/NFTGrid.tsx",
    "src/app/HomeClient.tsx"
  ]
)
```

**Expected**: All spacing uses design tokens ✓

**❌ THIS IS A CRITICAL VALIDATION - DO NOT SKIP**

### Step 6.3: Validate Accessibility ⚠️ MANDATORY

```bash
# ⚠️ REQUIRED: Check a11y compliance
mcp_skullcandy-mc_validate_a11y_rules(
  component="NFTGrid"
)
```

**Expected**: ARIA labels, keyboard navigation, semantic HTML ✓

**❌ THIS IS A CRITICAL VALIDATION - DO NOT SKIP**

### Step 6.4: Test Backend Integration

**Manual Test**:
1. Start dev server: `pnpm dev`
2. Open http://localhost:3000
3. Verify products load (should see 23 items, not 3)
4. Check Network tab: API call to backend successful
5. Verify images load from Cloudinary

### Step 6.5: Test Search Functionality

**Manual Test**:
1. Type in search bar
2. Verify product list filters in real-time
3. Test edge cases: empty query, no results, special characters
4. Clear search - all products should reappear

### Step 6.6: Test Cart Functionality

**Manual Test**:
1. Click "Bid now" on any product
2. Verify snackbar shows success message
3. Check cart badge/icon updates with count
4. Open cart - verify item appears
5. Remove item - verify removal + snackbar
6. Refresh page - verify cart persists (if localStorage added)

---

## Phase 7: Visual Validation

### Step 7.1: Compare with Figma Screenshot

```bash
# Get Figma screenshot for comparison
mcp_figma-mcp-ser_get_screenshot(
  nodeId="121:6097",
  clientLanguages="typescript",
  clientFrameworks="react"
)
```

**Manual Check**:
- [ ] Gap spacing matches (24px uniform)
- [ ] Product cards align properly
- [ ] Search bar visible and positioned correctly
- [ ] Typography matches (Orbitron titles, Outfit body)
- [ ] Colors match (glass morphism backgrounds)
- [ ] Border radius consistent

### Step 7.2: Responsive Testing

**Test Breakpoints**:
- [ ] Mobile (320px-767px): Single column
- [ ] Tablet (768px-1023px): 2 columns
- [ ] Desktop (1024px+): 3 columns
- [ ] Large Desktop (1366px+): Layout centers properly

---

## Success Criteria Checklist

### ⚠️ CRITICAL: Layout & Spacing Validation

**Horizontal Spacing (gap-x)**:
- [ ] ❌ REMOVED: `gap-x-2` (8px - WRONG)
- [ ] ✅ ADDED: Part of `gap-6` (24px - CORRECT)
- [ ] Verify: Cards have equal spacing between them horizontally

**Vertical Spacing (gap-y)**:
- [ ] ❌ REMOVED: `gap-y-10` (40px - WRONG)
- [ ] ✅ ADDED: Part of `gap-6` (24px - CORRECT)
- [ ] Verify: Rows have equal spacing between them vertically

**Gap Implementation**:
- [ ] Uses single `gap-6` utility (NOT separate gap-x/gap-y)
- [ ] No asymmetric spacing classes present
- [ ] Matches Figma `itemSpacing: 24` exactly

**Container Padding**:
- [ ] Product List padding: `px-[32px] py-[64px]`
- [ ] Matches Figma paddingLeft/Right: 32, paddingTop/Bottom: 64

**Visual Verification**:
- [ ] Flex-wrap horizontal layout maintained
- [ ] Cards align in grid with uniform gaps
- [ ] Visual spacing matches Figma pixel-perfect
- [ ] No cramped horizontal spacing
- [ ] No excessive vertical spacing

### Search Functionality
- [ ] Search bar visible by default
- [ ] Real-time filtering works
- [ ] No results handled gracefully
- [ ] Search persists during navigation (if needed)

### Backend Integration
- [ ] API fetches 23 products successfully
- [ ] Products display with correct data
- [ ] Error handling for API failures
- [ ] Loading states implemented
- [ ] Images load from backend URLs

### Cart Functionality
- [ ] Add to cart works
- [ ] Cart displays items correctly
- [ ] Remove from cart works
- [ ] Cart count updates
- [ ] Snackbar notifications show

### Code Quality
- [ ] No hardcoded pixel values (uses tokens)
- [ ] TypeScript types correct
- [ ] No console errors
- [ ] Components follow project patterns
- [ ] Accessibility compliant (WCAG AA)

---

## Files Modified Summary

| File | Changes | Lines |
|------|---------|-------|
| `src/components/nft-grid/NFTGrid.tsx` | Fix gap classes | ~15-19 |
| `src/components/section-heading/SectionHeading.tsx` | Enable showSearch default | ~10 |
| `src/app/page.tsx` | Add API fetch logic | Entire file |
| `src/app/HomeClient.tsx` | Search state, API integration, cart | ~30-95 |
| `src/contexts/CartContext.tsx` | Create cart context | New file |
| `src/app/layout.tsx` | Wrap with CartProvider | ~20-25 |

**Total Files Modified**: 6 (5 existing + 1 new)

---

## MCP Tool Usage Summary

**⚠️ ALL 4 SKULLCANDY MCP TOOLS MUST BE CALLED - TRACK YOUR PROGRESS:**

| Phase | MCP Tool | Server | Purpose | Status |
|-------|----------|--------|---------|--------|
| 1.3 | `extract_layout` | SkullCandy | Parse layout intent | ⬜ Required |
| 2.2 | `list_tokens` | SkullCandy | Verify spacing tokens | ⬜ Required |
| 2.3 | `validate_token_usage` | SkullCandy | Check hardcoded values | ⬜ Required |
| 3.1 | `get_component_context` | SkullCandy | Verify SearchBar exists | ⬜ Required |

**Figma MCP Tools (also required):**

| Phase | MCP Tool | Server | Purpose | Status |
|-------|----------|--------|---------|--------|
| 1.1 | `get_design_context` | Figma | Extract exact specs | ⬜ Required |
| 1.2 | `get_metadata` | Figma | Get node hierarchy | ⬜ Required |
| 7.1 | `get_screenshot` | Figma | Visual comparison | ⬜ Required |

**Total MCP Calls Required**: 10 (7 SkullCandy + 3 Figma)

**❌ IMPLEMENTATION IS INCOMPLETE WITHOUT ALL 10 TOOL CALLS**

These tools provide deterministic validation and ensure:
- Zero hardcoded values
- Exact Figma match
- Design system compliance
- Component API correctness

---

## Rollback Instructions

If issues occur, rollback changes:

```bash
# Revert to last commit
git reset --hard HEAD

# Or revert specific files
git checkout HEAD -- src/components/nft-grid/NFTGrid.tsx
git checkout HEAD -- src/app/HomeClient.tsx
git checkout HEAD -- src/app/page.tsx
```

---

## Post-Implementation

After all fixes applied:

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Fix demo issues: correct layout gaps, enable search, integrate backend API, implement cart"
   ```

2. **Test in Production**:
   ```bash
   pnpm build
   pnpm start
   ```

3. **Update Documentation**:
   - Update `docs/components/NFTGrid.md` with correct gap values
   - Update `docs/changelogs/` with implementation notes

4. **Demo Script**:
   - Show "before" state (cramped layout, 3 products)
   - Run this prompt to fix issues
   - Show "after" state (proper spacing, 23 products, search + cart working)
   - Highlight zero assumptions (all from Figma metadata)

---

**End of Prompt** ✅
