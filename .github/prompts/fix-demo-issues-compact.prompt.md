# Fix Demo Issues - Compact Workflow

**API**: `https://devday-aavn-d5284e914439.herokuapp.com/api/products`

---

## 🎯 Core Rules

1. Read `.github/instructions/component-patterns.instructions.md` and `figma-mcp.instructions.md`
2. Extract measurements from Figma MCP design info ONLY (never screenshots)
3. Call ALL mandatory MCP tools
4. Use semantic token classes (no hardcoded values)
5. WAIT for user confirmation before executing

---

## ⚠️ CRITICAL: Grid Gap Extraction

### Mandatory Gap Check Protocol

**Rule**: `itemSpacing` is PRIMARY AXIS ONLY. Vertical/horizontal gaps are OFTEN DIFFERENT.

**Required Fields from MCP design_context**:
- `itemSpacing` → Primary axis gap (horizontal if layoutMode=HORIZONTAL)
- `counterAxisSpacing` → Secondary axis gap (vertical if layoutMode=HORIZONTAL)
- `layoutMode` → HORIZONTAL or VERTICAL
- `layoutWrap` → WRAP or NO_WRAP

**Extraction Steps**:
1. Call `get_design_context` → Parse generated Tailwind classes for gap values
2. Check `get_metadata` → Look for `itemSpacing` and `counterAxisSpacing` fields
3. Extract from code: Look for `gap-[Xpx]` or `gap-x-[X] gap-y-[Y]` patterns
4. **If only `itemSpacing` exists**: Calculate vertical from node Y positions OR find counterAxisSpacing
5. Decision:
   - Same values → `gap-[value]`
   - Different values → `gap-x-[H] gap-y-[V]`

**Red Flags**:
- ❌ Using single `gap-*` without checking BOTH axes in design_context
- ❌ Assuming itemSpacing applies to both dimensions
- ❌ Not parsing Tailwind classes from get_design_context output

---

## 📋 Workflow Phases

### Phase 1: Analyze
1. `get_design_context(nodeId)` → Parse gap classes from generated code
2. `get_metadata(nodeId)` → Extract itemSpacing, counterAxisSpacing, layout properties
3. `get_variable_defs(nodeId)` → Get design tokens
4. `extract_layout(figma_node)` → Confirm layout structure

### Phase 2: Fix Layout
1. `list_tokens(scope=["spacing"])` → Verify token scale
2. Update NFTGrid gap classes based on extracted values
3. `validate_token_usage(filePaths)` → Check no hardcoded values

### Phase 3: Search
1. Update SectionHeading showSearch default
2. Add search state in HomeClient
3. Implement filter logic

### Phase 4: API
1. Fetch from API in page.tsx (server)
2. Pass products to HomeClient
3. Remove mock data

### Phase 5: Cart
1. Create CartContext
2. Wrap app with CartProvider
3. Wire handlers in HomeClient
4. Uncomment Cart component

### Phase 6-7: Validate
1. `diff_figma_vs_code(component, figma_node)` → Check parity
2. `validate_a11y_rules(component)` → Accessibility
3. `get_screenshot(nodeId)` → Visual verification

---

## 🔧 Implementation Rules

### Gap Extraction from MCP

**Priority Order**:
1. Parse Tailwind classes from `get_design_context` output (e.g., `gap-[24px]` or `gap-x-[24px] gap-y-[96px]`)
2. Check `counterAxisSpacing` field in metadata
3. Calculate from node Y positions: `(nextRow_Y - currentRow_Y) - cardHeight`

**Decision Logic**:
- If horizontal = vertical → `gap-[value]`
- If horizontal ≠ vertical → `gap-x-[H] gap-y-[V]`

### File Targets
- `src/components/nft-grid/NFTGrid.tsx` → Gap classes
- `src/components/section-heading/SectionHeading.tsx` → showSearch default
- `src/app/page.tsx` → API fetch
- `src/app/HomeClient.tsx` → Search state, cart handlers
- `src/contexts/CartContext.tsx` → New file
- `src/app/layout.tsx` → CartProvider wrapper

### Success Criteria
- All MCP tools called
- Gap spacing matches Figma (both axes verified)
- No hardcoded values
- Search functional
- API integrated
- Cart functional
- Accessible

---

## 🚫 Critical Errors to Avoid

- ❌ Assuming itemSpacing = vertical gap
- ❌ Not parsing gap values from get_design_context output
- ❌ Using single `gap-*` without checking both axes
- ❌ Skipping MCP tool calls
- ❌ Implementing without user confirmation
- ❌ Hardcoded values
- ❌ Creating duplicate components

---

## 📝 Reference

**Node IDs**: Monthly Collection `121:6097`, Header `121:6098`, Product List `121:6103`

**STOP and WAIT** for user confirmation after presenting plan.
