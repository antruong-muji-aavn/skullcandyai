---
mode: 'agent'
model: 'Claude Sonnet 4.5'
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'figma-mcp-server/*', 'skullcandy-mcp/*', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos']
description: 'Analyze Figma frame selection against current code implementation, identify issues, and provide precise fix recommendations using both MCP servers'
---

# Figma Frame Analysis & Layout Fix Recommendations

Analyze the currently selected Figma frame/component and compare against existing code implementation to identify layout issues and provide accurate fix recommendations.

## Referenced Instructions
- [Figma MCP Integration Rules](../instructions/figma-mcp.instructions.md)
- [Component Patterns & Design System](../instructions/component-patterns.instructions.md)
- [Documentation Standards](../instructions/documentation-standards.instructions.md)
- [Copilot Main Instructions](../copilot-instructions.md)

## Phase 1: Figma Design Analysis

### 1.1 Get Design Context
```bash
# Get detailed design information from selected Figma frame
mcp_figma-mcp-ser_get_design_context(clientFrameworks="react", clientLanguages="typescript")
```

### 1.2 Extract Layout Structure  
```bash
# Extract layout intent and constraints
mcp_skullcandy-mc_extract_layout(figma_node=<figma_node_from_step_1>)
```

### 1.3 Get Metadata Overview
```bash  
# Get structural overview of the frame
mcp_figma-mcp-ser_get_metadata(clientFrameworks="react", clientLanguages="typescript")
```

### 1.4 Visual Reference
```bash
# Get screenshot for visual reference (NOT for measurements)
mcp_figma-mcp-ser_get_screenshot(clientFrameworks="react", clientLanguages="typescript")
```

## Phase 2: Current Code Analysis

### 2.1 Identify Components in Figma
```bash
# Match Figma elements to design system components
mcp_skullcandy-mc_match_components(figma_node=<figma_node_from_phase_1>)
```

### 2.2 Check Existing Components
```bash
# List available components in design system
mcp_skullcandy-mc_list_components()
```

### 2.3 Get Component Context
For each identified component:
```bash
# Get implementation details for existing components
mcp_skullcandy-mc_get_component_context(name="<ComponentName>")
```

### 2.4 Compare Variants
For variant mismatches:
```bash
# Check for variant differences between Figma and code
mcp_skullcandy-mc_compare_variants(name="<ComponentName>")
```

## Phase 3: Issue Analysis & Recommendations

### 3.1 Layout Issues Analysis
**CRITICAL RULES:**
- ❌ **NEVER estimate measurements from screenshots**
- ✅ **ALWAYS use Figma metadata fields**: `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`, `itemSpacing`, `layoutMode`, `primaryAxisSizingMode`, etc.
- ✅ **Use design tokens**: Map Figma values to CSS custom properties in `tokens.css`

**Check for:**
- Wrong gap values (horizontal/vertical spacing)
- Incorrect padding/margins
- Missing flex/grid properties
- Wrong alignment settings
- Incorrect sizing constraints

### 3.2 Component Usage Analysis
**Evaluate:**
- Missing components that exist in design system
- Components used incorrectly (wrong variants/props)
- Custom implementations that should use design system components
- Inconsistent styling that should use design tokens

### 3.3 Token Validation
```bash
# Check for hardcoded values that should use tokens
mcp_skullcandy-mc_validate_token_usage(filePaths=["src/components/path/to/component.tsx"])
```

## Phase 4: Precise Recommendations

### 4.1 Layout Fixes
**Format:**
```typescript
// Current (WRONG):
className="gap-x-2 gap-y-10" // 8px × 40px

// Should be (from Figma metadata):
className="gap-x-6 gap-y-24" // 24px × 96px
```

**Always specify:**
- Exact CSS classes/values to change
- Which Figma metadata field provides the correct value
- Corresponding design token to use

### 4.2 Component Integration Recommendations
**Categories:**
- **Use Existing**: Components that already exist and should be used
- **Update Required**: Existing components that need variant updates
- **Create New**: Components that don't exist but should be created
- **Refactor**: Custom implementations that should use design system

### 4.3 Implementation Steps
```bash
# Generate implementation checklist
mcp_skullcandy-mc_implementation_steps(component="<ComponentName>", variant=<variant_object>)
```

## Phase 5: Validation & Output

### 5.1 Accessibility Check
```bash
# Validate accessibility requirements
mcp_skullcandy-mc_validate_a11y_rules(component="<ComponentName>")
```

### 5.2 Parity Analysis
```bash
# Check overall Figma vs code differences
mcp_skullcandy-mc_diff_figma_vs_code(component="<ComponentName>", figma_node=<figma_node>)
```

## Output Format

### Layout Analysis Summary
```markdown
## 🔍 Layout Issues Identified

### Current Implementation Problems:
- **Gap Spacing**: Using `gap-x-2 gap-y-10` (8px × 40px)
  - **Figma Value**: `itemSpacing: 24` horizontal, `48` vertical  
  - **Fix**: Use `gap-x-6 gap-y-12` (24px × 48px)

- **Padding**: Missing proper container padding
  - **Figma Value**: `paddingLeft: 32, paddingRight: 32`
  - **Fix**: Add `px-8` class (32px horizontal padding)

### Component Usage Issues:
- **Missing Component**: Should use `<SectionHeading>` for title/description
- **Wrong Variant**: `<Button>` should use `size="M"` not current implementation
- **Custom CSS**: Replace custom styling with design system tokens
```

### Recommendations Summary  
```markdown
## 🚀 Fix Recommendations

### Immediate Actions:
1. **Update NFTGrid gaps**: Change `md: 'gap-x-2 gap-y-10'` to `md: 'gap-x-6 gap-y-24'`
2. **Add SearchBar**: Integrate existing `<SearchBar>` component into `<SectionHeading>`
3. **Use Design Tokens**: Replace hardcoded values with CSS custom properties

### Component Integration:
- ✅ **Use**: `<SectionHeading showSearch={true}>` 
- 🔄 **Update**: `<NFTGrid>` layout constraints
- 🆕 **Create**: New variant for `<Button>` if needed

### Files to Modify:
- `src/components/nft-grid/NFTGrid.tsx` - Fix gap classes
- `src/components/section-heading/SectionHeading.tsx` - Add search integration
```

## Usage Instructions

1. **Select frame/component in Figma**
2. **Run this prompt** (VS Code will auto-detect selection)
3. **Review analysis** and recommendations
4. **Apply fixes** using provided exact code changes
5. **Validate result** matches Figma design

## Success Criteria

- ✅ **Zero assumptions**: All recommendations based on Figma metadata
- ✅ **Exact values**: Specific classes/tokens to use  
- ✅ **Component mapping**: Clear design system integration path
- ✅ **Actionable**: Ready-to-implement code changes
- ✅ **Validated**: Accessibility and responsive considerations included

---

**Example Usage:**  
Simply select a Figma frame and run this prompt. The analysis will automatically use the selected node and provide comprehensive, accurate recommendations for bringing your code into perfect alignment with the Figma design.