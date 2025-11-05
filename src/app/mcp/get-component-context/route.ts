import { NextRequest, NextResponse } from 'next/server';
import componentsData from '@/../../data/components.json';
import { normalizeComponentTokens } from '@/../../scripts/mcp/helpers/tokenNormalizer';

type ComponentData = {
  import: string;
  props: Record<string, string[]>;
  examples: string[];
  figma: {
    variants: Record<string, string[]>;
  };
  tokens: string[];
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json(
      {
        meta: { version: '0.2.0', source: 'skullcandy-mcp' },
        error: 'Missing required parameter: name',
      },
      { status: 400 }
    );
  }

  const componentData = (componentsData as Record<string, ComponentData>)[name];

  if (!componentData) {
    return NextResponse.json(
      {
        meta: { version: '0.2.0', source: 'skullcandy-mcp' },
        error: `Component '${name}' not found`,
      },
      { status: 404 }
    );
  }

  // Normalize tokens for MCP output
  const normalizedTokens = normalizeComponentTokens(
    componentData.tokens || [],
    true,  // includeValues
    true   // includeFigmaMappings
  );

  return NextResponse.json({
    meta: {
      version: '0.2.0',
      source: 'skullcandy-mcp',
    },
    component: {
      name,
      import: componentData.import,
      props: componentData.props,
      examples: componentData.examples || [],
      figma: componentData.figma || {},
    },
    tokens: {
      // MCP-friendly normalized token names (agent uses these)
      required: normalizedTokens.names,
      
      // Actual CSS variables (for code generation)
      cssVars: normalizedTokens.cssVars,
      
      // Resolved values (optional reference)
      resolved: normalizedTokens.resolved,
      
      // Figma mappings (shows relationship between Figma, CSS, and MCP)
      figmaMappings: normalizedTokens.figmaMappings,
      
      // Guidelines for agents
      guidelines: {
        noHardcodedHex: true,
        noInlinePxIfTokenExists: true,
        useCSSVarsInCode: true,
      },
    },
  });
}
