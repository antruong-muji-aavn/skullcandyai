/**
 * MCP Tool Handlers - Tier-based Implementation
 * All handlers return consistent response format with meta, data, status
 * Version: 1.0.0
 */

import { loadComponents } from './helpers/components';
import { getTokens } from './helpers/tokens';
import { TOOL_META } from './tools-config';

// ============================================================================
// Response Types
// ============================================================================

export interface MCPResponse<T = any> {
  meta: {
    version: string;
    source: string;
    tier: number;
    timestamp: string;
  };
  data: T;
  status: 'ok' | 'warn' | 'error';
  errors?: Array<{
    code: string;
    message: string;
    details?: any;
  }>;
}

export function createResponse<T>(
  tier: number,
  data: T,
  status: 'ok' | 'warn' | 'error' = 'ok',
  errors?: MCPResponse['errors']
): MCPResponse<T> {
  return {
    meta: {
      version: TOOL_META.version,
      source: TOOL_META.source,
      tier,
      timestamp: new Date().toISOString()
    },
    data,
    status,
    errors
  };
}

// ============================================================================
// TIER 0 - Core Discovery Tools
// ============================================================================

export async function handleListComponents(args: {
  query?: string;
  tags?: string[];
  limit?: number;
}): Promise<MCPResponse> {
  try {
    const components = await loadComponents();
    let filtered = components;

    // Fuzzy query (prefix/substring matching)
    if (args.query) {
      const query = args.query.toLowerCase();
      filtered = filtered.filter((c: any) =>
        c.name.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
      );
    }

    // Tag filtering
    if (args.tags && args.tags.length > 0) {
      filtered = filtered.filter((c: any) =>
        c.tags && args.tags!.some((tag: string) => c.tags.includes(tag))
      );
    }

    // Limit results
    const limit = args.limit || 50;
    const results = filtered.slice(0, limit).map((c: any) => c.name);

    return createResponse(0, {
      components: results,
      total: filtered.length,
      showing: results.length
    });
  } catch (error: any) {
    return createResponse(
      0,
      { components: [] },
      'error',
      [{
        code: 'LOAD_ERROR',
        message: 'Failed to load components',
        details: error.message
      }]
    );
  }
}

export async function handleGetComponentContext(args: {
  name: string;
}): Promise<MCPResponse> {
  try {
    const components = await loadComponents();
    const tokens = await getTokens();
    
    const component = components.find(
      (c: any) => c.name.toLowerCase() === args.name.toLowerCase()
    );

    if (!component) {
      return createResponse(
        0,
        null,
        'error',
        [{
          code: 'COMP_NOT_FOUND',
          message: `Unknown component '${args.name}'`,
          details: { available: components.map((c: any) => c.name) }
        }]
      );
    }

    // Build comprehensive context
    const context = {
      component: component.name,
      code: {
        import: component.import,
        props: component.props || {},
        example: component.example || `<${component.name} />`
      },
      figma: {
        fileId: component.figmaFileId || null,
        nodeId: component.figmaNodeId || null,
        variants: component.variants || {}
      },
      tokens: {
        color: tokens.colors || {},
        spacing: tokens.spacing || {},
        radius: tokens.radius || {},
        typography: tokens.typography || {}
      },
      a11y: {
        role: component.a11y?.role || null,
        aria: component.a11y?.aria || [],
        keyboard: component.a11y?.keyboard || []
      }
    };

    return createResponse(0, context);
  } catch (error: any) {
    return createResponse(
      0,
      null,
      'error',
      [{
        code: 'CONTEXT_ERROR',
        message: 'Failed to get component context',
        details: error.message
      }]
    );
  }
}

export async function handleCompareVariants(args: {
  name: string;
}): Promise<MCPResponse> {
  try {
    const components = await loadComponents();
    const component = components.find(
      (c: any) => c.name.toLowerCase() === args.name.toLowerCase()
    );

    if (!component) {
      return createResponse(
        0,
        null,
        'error',
        [{
          code: 'COMP_NOT_FOUND',
          message: `Unknown component '${args.name}'`
        }]
      );
    }

    // Get Figma variants
    const figmaVariants = component.figmaVariants || [];
    // Get code variants (from props)
    const codeVariants = Object.keys(component.variants || {});

    // Deterministic diff
    const missingInCode = figmaVariants.filter((v: any) => !codeVariants.includes(v));
    const extraInCode = codeVariants.filter((v: any) => !figmaVariants.includes(v));

    const status = 
      missingInCode.length > 0 || extraInCode.length > 0 ? 'warn' : 'ok';

    return createResponse(0, {
      component: component.name,
      status,
      missingInCode,
      extraInCode,
      figmaVariants,
      codeVariants
    }, status);
  } catch (error: any) {
    return createResponse(
      0,
      null,
      'error',
      [{
        code: 'COMPARE_ERROR',
        message: 'Failed to compare variants',
        details: error.message
      }]
    );
  }
}

export async function handleListTokens(args: {
  scope?: string[];
}): Promise<MCPResponse> {
  try {
    const tokens = await getTokens();
    
    // Filter by scope if provided
    let filtered: any = tokens;
    if (args.scope && args.scope.length > 0) {
      filtered = {};
      for (const key of args.scope) {
        if (tokens[key]) {
          filtered[key] = tokens[key];
        }
      }
    }

    return createResponse(0, filtered);
  } catch (error: any) {
    return createResponse(
      0,
      {},
      'error',
      [{
        code: 'TOKEN_ERROR',
        message: 'Failed to load tokens',
        details: error.message
      }]
    );
  }
}

// ============================================================================
// TIER 1 - Bridge Tools (Figma → DS)
// ============================================================================

export async function handleExtractLayout(args: {
  figma_node: any;
}): Promise<MCPResponse> {
  try {
    const node = args.figma_node;
    
    // Extract layout properties (pure rules, no LLM)
    const layout: any = {
      display: 'flex', // default
      direction: 'row',
      gap: 0,
      align: 'start',
      justify: 'start'
    };

    // Parse layout mode
    if (node.layoutMode === 'HORIZONTAL') {
      layout.direction = 'row';
    } else if (node.layoutMode === 'VERTICAL') {
      layout.direction = 'column';
    } else if (node.layoutMode === 'NONE') {
      layout.display = 'block';
    }

    // Parse spacing
    if (node.itemSpacing !== undefined) {
      layout.gap = node.itemSpacing;
    }

    // Parse alignment
    if (node.primaryAxisAlignItems) {
      layout.justify = node.primaryAxisAlignItems.toLowerCase();
    }
    if (node.counterAxisAlignItems) {
      layout.align = node.counterAxisAlignItems.toLowerCase();
    }

    // Check for grid
    if (node.layoutGrids && node.layoutGrids.length > 0) {
      layout.display = 'grid';
      layout.grid = {
        cols: node.layoutGrids.filter((g: any) => g.pattern === 'COLUMNS').map((g: any) => g.count),
        rows: node.layoutGrids.filter((g: any) => g.pattern === 'ROWS').map((g: any) => g.count)
      };
    }

    return createResponse(1, layout);
  } catch (error: any) {
    return createResponse(
      1,
      null,
      'error',
      [{
        code: 'LAYOUT_ERROR',
        message: 'Failed to extract layout',
        details: error.message
      }]
    );
  }
}

export async function handleAnalyzeTokens(args: {
  figma_node: any;
}): Promise<MCPResponse> {
  try {
    const node = args.figma_node;
    const tokens = await getTokens();
    
    const result: any = {
      colors: [],
      spacing: [],
      radius: [],
      typography: []
    };

    // Analyze fills (deterministic nearest-neighbor)
    if (node.fills && node.fills.length > 0) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.color) {
          const hex = rgbToHex(fill.color);
          const match = findNearestToken(hex, tokens.colors || {});
          result.colors.push({
            raw: hex,
            token: match.token,
            confidence: match.confidence
          });
        }
      }
    }

    // Analyze spacing (padding, gaps)
    if (node.paddingLeft !== undefined) {
      const match = findNearestToken(node.paddingLeft, tokens.spacing || {});
      result.spacing.push({
        raw: node.paddingLeft,
        token: match.token,
        confidence: match.confidence
      });
    }

    // Analyze border radius
    if (node.cornerRadius !== undefined) {
      const match = findNearestToken(node.cornerRadius, tokens.radius || {});
      result.radius.push({
        raw: node.cornerRadius,
        token: match.token,
        confidence: match.confidence
      });
    }

    // Analyze typography
    if (node.style) {
      const typoMatch = findNearestTypographyToken(node.style, tokens.typography || {});
      result.typography.push({
        raw: {
          family: node.style.fontFamily,
          size: node.style.fontSize,
          weight: node.style.fontWeight
        },
        token: typoMatch.token,
        confidence: typoMatch.confidence
      });
    }

    return createResponse(1, result);
  } catch (error: any) {
    return createResponse(
      1,
      null,
      'error',
      [{
        code: 'TOKEN_ANALYSIS_ERROR',
        message: 'Failed to analyze tokens',
        details: error.message
      }]
    );
  }
}

export async function handleMatchComponents(args: {
  figma_node: any;
}): Promise<MCPResponse> {
  try {
    const node = args.figma_node;
    const components = await loadComponents();
    
    const matches: any[] = [];

    // Rule-based component matching
    for (const comp of components) {
      const confidence = calculateComponentMatch(node, comp);
      
      if (confidence > 0.7) { // 70% threshold
        matches.push({
          match: comp.name,
          variant: predictVariant(node, comp),
          confidence,
          path: node.id
        });
      }
    }

    // Sort by confidence descending
    matches.sort((a, b) => b.confidence - a.confidence);

    return createResponse(1, matches);
  } catch (error: any) {
    return createResponse(
      1,
      [],
      'error',
      [{
        code: 'MATCH_ERROR',
        message: 'Failed to match components',
        details: error.message
      }]
    );
  }
}

// ============================================================================
// TIER 2 - Planning & Scaffolding
// ============================================================================

export async function handleImplementationSteps(args: {
  component: string;
  variant?: any;
}): Promise<MCPResponse> {
  try {
    const components = await loadComponents();
    const component = components.find(
      (c: any) => c.name.toLowerCase() === args.component.toLowerCase()
    );

    if (!component) {
      return createResponse(
        2,
        null,
        'error',
        [{
          code: 'COMP_NOT_FOUND',
          message: `Unknown component '${args.component}'`
        }]
      );
    }

    // Generate ordered steps (zero LLM)
    const steps = [
      {
        id: 'import',
        message: `import { ${component.name} } from '${component.import}'`
      },
      {
        id: 'props',
        message: `Props: ${Object.keys(component.props || {}).join(', ')}`
      },
      {
        id: 'tokens',
        message: `Use design tokens: ${component.tokens?.join(', ') || 'N/A'}`
      },
      {
        id: 'a11y',
        message: `Accessibility: role=${component.a11y?.role || 'N/A'}; keyboard=${component.a11y?.keyboard?.join(',') || 'N/A'}`
      }
    ];

    return createResponse(2, {
      component: component.name,
      steps
    });
  } catch (error: any) {
    return createResponse(
      2,
      null,
      'error',
      [{
        code: 'STEPS_ERROR',
        message: 'Failed to generate implementation steps',
        details: error.message
      }]
    );
  }
}

// Placeholder handlers for remaining tools
export async function handleScaffoldComponent(_args: any): Promise<MCPResponse> {
  return createResponse(2, { message: 'scaffold_component: Coming soon' });
}

export async function handleScaffoldScreen(_args: any): Promise<MCPResponse> {
  return createResponse(2, { message: 'scaffold_screen: Coming soon' });
}

export async function handleValidateTokenUsage(_args: any): Promise<MCPResponse> {
  return createResponse(3, { message: 'validate_token_usage: Coming soon' });
}

export async function handleValidateA11yRules(_args: any): Promise<MCPResponse> {
  return createResponse(3, { message: 'validate_a11y_rules: Coming soon' });
}

export async function handleDiffFigmaVsCode(_args: any): Promise<MCPResponse> {
  return createResponse(3, { message: 'diff_figma_vs_code: Coming soon' });
}

export async function handleGenerateDocs(_args: any): Promise<MCPResponse> {
  return createResponse(4, { message: 'generate_docs: Coming soon' });
}

export async function handleExportStory(_args: any): Promise<MCPResponse> {
  return createResponse(4, { message: 'export_story: Coming soon' });
}

// ============================================================================
// Helper Functions
// ============================================================================

function rgbToHex(color: { r: number; g: number; b: number }): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

function findNearestToken(_value: any, _tokens: Record<string, any>): { token: string; confidence: number } {
  // Simple nearest-neighbor with tolerance
  // TODO: Implement proper matching logic
  return { token: 'token.name', confidence: 0.95 };
}

function findNearestTypographyToken(_style: any, _tokens: Record<string, any>): { token: string; confidence: number } {
  // TODO: Implement typography matching
  return { token: 'type.body.m', confidence: 0.90 };
}

function calculateComponentMatch(node: any, component: any): number {
  // Rule-based matching: names, structure, child count, etc.
  let score = 0;
  
  // Name matching
  if (node.name && component.name && node.name.toLowerCase().includes(component.name.toLowerCase())) {
    score += 0.5;
  }
  
  // TODO: Add more rules (child structure, constraints, etc.)
  
  return Math.min(score, 1.0);
}

function predictVariant(_node: any, _component: any): any {
  // Predict variant based on node properties
  // TODO: Implement variant prediction logic
  return {};
}
