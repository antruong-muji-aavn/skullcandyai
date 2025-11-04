import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import componentsData from '@/../../data/components.json';
import tokensData from '@/../../data/tokens.json';

// WORKAROUND: Global cache for mcp-handler bug where arguments aren't passed
let cachedToolArguments: Record<string, any> = {};

// Helper to extract layout structure from TSX/metadata
function extractLayoutStructure(designContext: string, metadata: any): any {
  const structure: any = {
    type: 'container',
    layout: 'flex-col',
    spacing: [],
    children: [],
  };

  // Detect layout type from TSX
  if (/flex-col/i.test(designContext)) structure.layout = 'flex-col';
  else if (/flex-row|flex\s+/i.test(designContext)) structure.layout = 'flex-row';
  else if (/grid/i.test(designContext)) structure.layout = 'grid';

  // Extract spacing values
  const gapMatches = designContext.match(/gap-\[(\d+)px\]/g);
  if (gapMatches) {
    structure.spacing = gapMatches.map((g: string) => g.match(/\d+/)?.[0] + 'px');
  }

  // Extract padding
  const paddingMatch = designContext.match(/p[xy]?-\[(\d+)px\]/g);
  if (paddingMatch) {
    structure.padding = paddingMatch.map((p: string) => p.match(/\d+/)?.[0] + 'px');
  }

  // Parse metadata for node hierarchy
  if (metadata?.nodeNames) {
    structure.children = metadata.nodeNames.map((name: string) => ({
      name,
      type: inferNodeType(name),
    }));
  }

  return structure;
}

// Helper to infer component type from node name
function inferNodeType(name: string): string {
  const lower = name.toLowerCase();
  if (/button|btn|cta/i.test(lower)) return 'button';
  if (/card|product|nft/i.test(lower)) return 'card';
  if (/search|input|field/i.test(lower)) return 'input';
  if (/title|heading/i.test(lower)) return 'heading';
  if (/nav|menu|header/i.test(lower)) return 'navigation';
  if (/grid|list|container/i.test(lower)) return 'container';
  if (/image|img|picture/i.test(lower)) return 'image';
  return 'generic';
}

// Helper to extract and map design tokens
function extractDesignTokens(designContext: string, variables: any): any {
  const tokens: any = {
    colors: [],
    typography: [],
    spacing: [],
    effects: [],
    borders: [],
  };

  // Extract colors from TSX
  const colorMatches = designContext.match(/(?:bg-|text-|border-)\[(?:rgba?\([^)]+\)|#[0-9a-f]{3,8}|var\([^)]+\))\]/gi);
  if (colorMatches) {
    const uniqueColors = Array.from(new Set(colorMatches));
    tokens.colors = uniqueColors.map((c: string) => ({
      className: c,
      value: c.match(/\[(.*?)\]/)?.[1],
    }));
  }

  // Extract typography
  const fontSizeMatches = designContext.match(/text-\[(\d+)px\]/g);
  if (fontSizeMatches) {
    const uniqueFonts = Array.from(new Set(fontSizeMatches));
    tokens.typography = uniqueFonts.map((f: string) => ({
      className: f,
      size: f.match(/\d+/)?.[0] + 'px',
    }));
  }

  // Extract spacing
  const spacingMatches = designContext.match(/(?:p|m|gap)-\[(\d+)px\]/g);
  if (spacingMatches) {
    const uniqueSpacing = Array.from(new Set(spacingMatches));
    tokens.spacing = uniqueSpacing.map((s: string) => ({
      className: s,
      value: s.match(/\d+/)?.[0] + 'px',
    }));
  }

  // Extract effects
  if (/backdrop-blur/i.test(designContext)) {
    const blurMatches = designContext.match(/backdrop-blur-\[([^\]]+)\]/g);
    tokens.effects.push({
      type: 'backdrop-blur',
      values: blurMatches?.map((b: string) => b.match(/\[([^\]]+)\]/)?.[1]) || [],
    });
  }

  if (/rounded/i.test(designContext)) {
    const radiusMatches = designContext.match(/rounded-\[([^\]]+)\]/g);
    tokens.borders.push({
      type: 'border-radius',
      values: radiusMatches?.map((r: string) => r.match(/\[([^\]]+)\]/)?.[1]) || [],
    });
  }

  // Merge with Figma variables if provided
  if (variables) {
    tokens.figmaVariables = Object.keys(variables).reduce((acc: any, key: string) => {
      acc[key] = variables[key];
      return acc;
    }, {});
  }

  return tokens;
}

// Helper to generate implementation steps
function generateImplementationSteps(suggestions: any[], layout: any, tokens: any): any[] {
  const steps: any[] = [
    {
      order: 1,
      title: 'Setup Layout Container',
      description: `Create main container with ${layout.layout} layout`,
      code: `<div className="${layout.layout} ${layout.spacing.length ? 'gap-[' + layout.spacing[0] + ']' : ''}">`,
    },
    {
      order: 2,
      title: 'Import Required Components',
      description: 'Import all matched components from design system',
      code: suggestions
        .map((s: any) => `import { ${s.component} } from '${s.import}';`)
        .join('\n'),
    },
  ];

  // Add component-specific steps
  suggestions.forEach((s: any, idx: number) => {
    steps.push({
      order: 3 + idx,
      title: `Implement ${s.component}`,
      description: `Add ${s.component} with appropriate props`,
      code: s.usage,
      props: s.props,
    });
  });

  // Add styling step
  steps.push({
    order: 3 + suggestions.length,
    title: 'Apply Design Tokens',
    description: 'Use extracted tokens for colors, spacing, typography',
    tokens: {
      colors: tokens.colors.slice(0, 5),
      spacing: tokens.spacing.slice(0, 5),
      typography: tokens.typography.slice(0, 3),
    },
  });

  return steps;
}

// Helper to generate code scaffold
function generateCodeScaffold(suggestions: any[], layout: any, metadata: any): string {
  const componentName = metadata?.rootName || 'Component';
  const imports = suggestions
    .map((s: any) => `import { ${s.component} } from '${s.import}';`)
    .join('\n');

  const childComponents = suggestions
    .map((s: any) => `  ${s.usage}`)
    .join('\n\n');

  return `// Generated scaffold for ${componentName}
${imports}

export function ${componentName}() {
  return (
    <div className="${layout.layout} ${layout.spacing.length ? 'gap-[' + layout.spacing[0] + ']' : ''}">
${childComponents}
    </div>
  );
}`;
}

// Helper function to analyze Figma context and suggest components
function analyzeAndSuggestComponents(figmaContext: any): any[] {
  const suggestions: any[] = [];
  
  // Extract useful info from various input sources
  const metadataNames = figmaContext.metadata?.nodeNames?.join(' ').toLowerCase() || '';
  const rawContext = figmaContext.raw?.toLowerCase() || '';
  
  // Pattern detection from TSX code or metadata
  const hasButton = figmaContext.hasButton || /button|btn/i.test(metadataNames);
  const hasCard = figmaContext.hasCard || /card|product/i.test(metadataNames);
  const hasInput = figmaContext.hasInput || /input|search|field/i.test(metadataNames);
  const hasNavigation = figmaContext.hasNavigation || /navigation|navbar|header|menu/i.test(metadataNames);
  const hasImage = figmaContext.hasImage || /image|img/i.test(rawContext);
  const hasBackdropBlur = figmaContext.hasBackdropBlur || /backdrop-blur|glass/i.test(rawContext);
  const hasGradient = figmaContext.hasGradient || /gradient/i.test(rawContext);
  const hasGrid = figmaContext.hasGrid || /grid|flex-wrap/i.test(rawContext);
  const hasTimer = figmaContext.hasTimer || /timer|countdown|hours|minutes|seconds/i.test(metadataNames);
  const hasPrice = figmaContext.hasPrice || /eth|price|bid|cost/i.test(metadataNames);
  const hasCart = /cart|shopping|checkout/i.test(metadataNames);
  const hasHero = /hero|banner|featured/i.test(metadataNames);
  const hasHeading = /heading|title|section.*title/i.test(metadataNames);
  
  // Match patterns with our components
  const componentKeys = Object.keys(componentsData);
  
  componentKeys.forEach((componentName) => {
    const component = (componentsData as any)[componentName];
    let matchScore = 0;
    let matchReasons: string[] = [];
    
    // Button matching
    if (componentName === 'Button' && hasButton) {
      matchScore = 92;
      matchReasons.push('Detected button pattern in design');
      if (hasGradient) {
        matchScore += 3;
        matchReasons.push('Has gradient (CTA variant)');
      }
      if (hasBackdropBlur) {
        matchScore += 3;
        matchReasons.push('Has glass morphism (Neutral variant)');
      }
    }
    
    // NFTCard matching
    if (componentName === 'NFTCard' && hasCard) {
      matchScore = 95;
      matchReasons.push('Detected card pattern');
      if (hasImage) {
        matchScore += 2;
        matchReasons.push('Contains image');
      }
      if (hasTimer) {
        matchScore += 2;
        matchReasons.push('Has countdown timer');
      }
      if (hasPrice) {
        matchScore += 1;
        matchReasons.push('Has price/bid information');
      }
    }
    
    // SearchBar matching
    if (componentName === 'SearchBar' && hasInput) {
      matchScore = 88;
      matchReasons.push('Detected search/input field');
      if (hasBackdropBlur) {
        matchScore += 4;
        matchReasons.push('Has glass morphism styling');
      }
    }
    
    // Navbar matching
    if (componentName === 'Navbar' && hasNavigation) {
      matchScore = 94;
      matchReasons.push('Detected navigation pattern');
      if (hasBackdropBlur) {
        matchScore += 1;
        matchReasons.push('Has glass morphism styling');
      }
    }
    
    // Cart matching
    if (componentName === 'Cart' && hasCart) {
      matchScore = 93;
      matchReasons.push('Detected cart/shopping pattern');
      if (hasPrice) {
        matchScore += 2;
        matchReasons.push('Has price information');
      }
    }
    
    // SectionHeading matching
    if (componentName === 'SectionHeading' && hasHeading) {
      matchScore = 85;
      matchReasons.push('Detected heading pattern');
    }
    
    // NFTGrid matching
    if (componentName === 'NFTGrid' && hasGrid && hasCard) {
      matchScore = 90;
      matchReasons.push('Detected grid layout with cards');
    }
    
    // HeroSection matching
    if (componentName === 'HeroSection' && hasHero) {
      matchScore = 90;
      matchReasons.push('Detected hero/banner section');
      if (hasButton) {
        matchScore += 5;
        matchReasons.push('Has CTA button');
      }
    }
    
    if (matchScore > 0) {
      suggestions.push({
        component: componentName,
        matchScore,
        matchReasons,
        import: component.import,
        props: component.props,
        examples: component.examples,
        usage: generateUsageExample(componentName, component, figmaContext),
        figmaNodeId: figmaContext.nodeId,
      });
    }
  });
  
  // Sort by match score
  suggestions.sort((a, b) => b.matchScore - a.matchScore);
  
  return suggestions.slice(0, 8); // Return top 8 matches
}

// Generate usage example based on Figma context
function generateUsageExample(
  componentName: string,
  component: any,
  figmaContext: any
): string {
  const text = figmaContext.characters || figmaContext.text || 'Example Text';
  
  switch (componentName) {
    case 'Button':
      return `<Button style="CTA" size="M">${text}</Button>`;
    case 'NFTCard':
      return `<NFTCard variant="Default" price="0.45 ETH" timeLeft="03:42" verified />`;
    case 'SearchBar':
      return `<SearchBar size="M" placeholder="${text}" />`;
    case 'Navbar':
      return `<Navbar />`;
    default:
      return component.examples?.[0] || `<${componentName} />`;
  }
}

// Create MCP handler with all our tools
const handler = createMcpHandler(
  async (server) => {
    // Tool 1: List all components
    server.tool(
      'list_components',
      'List all available design system components',
      {},
      async () => {
        const components = Object.keys(componentsData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  meta: { version: '0.1.0', source: 'skullcandy-mcp' },
                  data: { components, count: components.length },
                  status: 'ok',
                },
                null,
                2
              ),
            },
          ],
        };
      }
    );

    // Tool 2: Get component context
    server.tool(
      'get_component_context',
      'Get comprehensive context for a component including import path, props, examples, and Figma variants',
      {
        name: z.string().describe('Component name (e.g., Button, NFTCard)'),
      },
      async ({ name }) => {
        const componentInfo = (componentsData as any)[name];
        if (!componentInfo) {
          throw new Error(`Component '${name}' not found`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  meta: { version: '0.1.0', source: 'skullcandy-mcp' },
                  data: {
                    component: {
                      name,
                      import: componentInfo.import,
                      props: componentInfo.props,
                      examples: componentInfo.examples,
                      figma: componentInfo.figma,
                    },
                    tokens: {},
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }
    );

    // Tool 3: List design tokens
    server.tool(
      'list_tokens',
      'List design tokens with optional scope filtering',
      {
        scope: z
          .string()
          .optional()
          .describe('Comma-separated scopes: color,spacing,typography'),
      },
      async ({ scope }) => {
        let filteredTokens: any = tokensData;

        if (scope) {
          const scopes = scope.split(',').map((s: string) => s.trim().toLowerCase());
          filteredTokens = Object.fromEntries(
            Object.entries(tokensData).filter(([key]) => {
              const tokenKey = key.toLowerCase();
              return scopes.some((s: string) => tokenKey.includes(s));
            })
          );
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  meta: { version: '0.1.0', source: 'skullcandy-mcp' },
                  data: {
                    tokens: filteredTokens,
                    count: Object.keys(filteredTokens).length,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }
    );

    // Tool 4: Compare Figma variants vs code props
    server.tool(
      'compare_variants',
      'Compare Figma variants vs code props to check for parity',
      {
        name: z.string().describe('Component name'),
      },
      async ({ name }) => {
        const componentInfo = (componentsData as any)[name];
        if (!componentInfo) {
          throw new Error(`Component '${name}' not found`);
        }

        const figmaVariants = componentInfo.figma?.variants || {};
        const codeProps = componentInfo.props || {};
        const comparison: any = {};

        const allProps = new Set([
          ...Object.keys(figmaVariants),
          ...Object.keys(codeProps),
        ]);

        allProps.forEach((prop) => {
          const figmaValues = figmaVariants[prop] || [];
          const codeValues = codeProps[prop] || [];
          const match =
            JSON.stringify(figmaValues.sort()) === JSON.stringify(codeValues.sort());
          comparison[prop] = { figma: figmaValues, code: codeValues, match };
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  meta: { version: '0.1.0', source: 'skullcandy-mcp' },
                  data: { component: name, comparison },
                },
                null,
                2
              ),
            },
          ],
        };
      }
    );

    // Tool 5: Suggest components from Figma output (TWO-STEP WORKFLOW)
    server.tool(
      'suggest_components_from_figma',
      `Analyze Figma design output and generate a complete implementation plan with:
- Layout structure and component hierarchy
- Exact component mappings with props
- Design tokens (colors, spacing, typography, effects)
- Step-by-step implementation guide
- Ready-to-use code scaffold

TWO-STEP WORKFLOW:
1. User calls Figma MCP tools directly (get_design_context, get_variable_defs, get_metadata, get_screenshot)
2. User passes the output to this tool for comprehensive analysis and implementation plan

REQUIRED: At least one of designContext, metadata, or variables must be provided.
OPTIMAL: Pass all three (designContext + metadata + variables) for most accurate analysis.

Example usage:
1. Call Figma MCP: get_design_context() + get_variable_defs() + get_metadata()
2. Call this tool with all outputs for complete implementation plan
3. Receive: component suggestions, layout structure, tokens, and code scaffold`,
      {
        type: 'object',
        properties: {
          designContext: {
            type: 'string',
            description: 'Output from Figma get_design_context (TSX code as string)',
          },
          metadata: {
            type: 'string',
            description: 'Output from Figma get_metadata (XML structure as string)',
          },
          variables: {
            type: 'string',
            description: 'Output from Figma get_variable_defs (JSON string with design tokens)',
          },
          screenshot: {
            type: 'string',
            description: 'Screenshot from Figma get_screenshot (base64 or URL) - optional visual reference',
          },
          nodeId: {
            type: 'string',
            description: 'Optional: Figma node ID for reference (not used for fetching)',
          },
        },
        additionalProperties: false,
      },
      async (args: any, _context?: any) => {
        // WORKAROUND: mcp-handler bug - use cached arguments from POST wrapper
        const params = cachedToolArguments['suggest_components_from_figma'] || args || {};
        console.log('[suggest_components_from_figma] Using cached params:', JSON.stringify(params, null, 2));
        
        const { designContext, metadata, variables, screenshot, nodeId } = params;
        try {
          // Validate that at least one input is provided
          if (!designContext && !metadata && !variables) {
            throw new Error(
              'At least one of designContext, metadata, or variables must be provided. ' +
              'Use Figma MCP tools first: get_design_context(), get_metadata(), or get_variable_defs()'
            );
          }

          // Parse inputs
          let parsedContext: any = {};
          let parsedMetadata: any = null;
          let parsedVariables: any = null;

          // Parse design context (TSX code → extract patterns)
          if (designContext) {
            parsedContext.raw = designContext;
            parsedContext.hasButton = /Button|button|btn/i.test(designContext);
            parsedContext.hasCard = /Card|card/i.test(designContext);
            parsedContext.hasInput = /Input|input|Search|search/i.test(designContext);
            parsedContext.hasNavigation = /Navigation|Navbar|nav|menu/i.test(designContext);
            parsedContext.hasImage = /Image|img|<img/i.test(designContext);
            parsedContext.hasBackdropBlur = /backdrop-blur/i.test(designContext);
            parsedContext.hasGradient = /gradient|linear-gradient/i.test(designContext);
            parsedContext.hasGrid = /grid|flex-wrap/i.test(designContext);
            parsedContext.hasTimer = /timer|countdown|time|seconds|minutes|hours/i.test(designContext);
            parsedContext.hasPrice = /ETH|price|bid|cost/i.test(designContext);
          }

          // Parse metadata (XML structure)
          if (metadata) {
            try {
              parsedMetadata = { raw: metadata };
              // Extract node names from XML
              const nodeNames = metadata.match(/data-name="([^"]+)"/gi) || [];
              parsedMetadata.nodeNames = nodeNames.map((n: string) => n.match(/"([^"]+)"/)?.[1] || '');
            } catch (e) {
              parsedMetadata = { raw: metadata, parseError: true };
            }
          }

          // Parse variables (design tokens)
          if (variables) {
            try {
              parsedVariables = JSON.parse(variables);
            } catch (e) {
              try {
                parsedVariables = { raw: variables };
              } catch {
                parsedVariables = null;
              }
            }
          }

          // Analyze and match with our components
          const suggestions = analyzeAndSuggestComponents({
            ...parsedContext,
            metadata: parsedMetadata,
            variables: parsedVariables,
            nodeId,
          });

          // Extract comprehensive layout and token information
          const layoutStructure = extractLayoutStructure(
            designContext || '',
            parsedMetadata
          );

          const designTokens = extractDesignTokens(
            designContext || '',
            parsedVariables
          );

          const implementationSteps = generateImplementationSteps(
            suggestions,
            layoutStructure,
            designTokens
          );

          const codeScaffold = generateCodeScaffold(
            suggestions,
            layoutStructure,
            parsedMetadata
          );

          // Build enhanced response
          const response: any = {
            meta: {
              version: '0.3.0',
              source: 'skullcandy-mcp',
              workflow: 'two-step (Figma MCP → SkullCandy MCP)',
              enhanced: true,
            },
            data: {
              nodeId: nodeId || 'unknown',
              inputSources: {
                designContext: !!designContext,
                metadata: !!metadata,
                variables: !!variables,
                screenshot: !!screenshot,
              },
              layout: {
                structure: layoutStructure,
                description: `${layoutStructure.layout} container with ${layoutStructure.spacing.length} spacing values`,
              },
              tokens: {
                summary: {
                  colors: designTokens.colors.length,
                  typography: designTokens.typography.length,
                  spacing: designTokens.spacing.length,
                  effects: designTokens.effects.length,
                  borders: designTokens.borders.length,
                },
                details: designTokens,
              },
              components: {
                count: suggestions.length,
                suggestions,
              },
              implementation: {
                steps: implementationSteps,
                scaffold: codeScaffold,
              },
              usage: {
                step1: 'Call Figma MCP: get_design_context() + get_variable_defs() + get_metadata()',
                step2: 'Call this tool with all outputs for complete analysis',
                step3: 'Follow implementation steps in order',
                step4: 'Use code scaffold as starting point',
              },
            },
          };

          // Add screenshot reference if provided
          if (screenshot) {
            response.data.screenshot = screenshot.startsWith('data:image')
              ? { type: 'base64', length: screenshot.length }
              : { type: 'url', url: screenshot };
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(response, null, 2),
              },
            ],
          };
        } catch (error) {
          throw new Error(
            `Failed to analyze Figma output: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }
    );
  },
  {
    capabilities: {
      tools: {},
    },
  },
  {
    basePath: '',
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true, // Use StreamableHTTP transport
  }
);

// WORKAROUND: Wrap POST handler to cache arguments before mcp-handler processes request
async function POST_WRAPPER(request: Request) {
  try {
    // Clone and parse request to extract arguments
    const body = await request.clone().json();
    if (body?.params?.name && body?.params?.arguments) {
      const toolName = body.params.name;
      cachedToolArguments[toolName] = body.params.arguments;
      console.log(`[POST_WRAPPER] Cached arguments for ${toolName}:`, JSON.stringify(body.params.arguments, null, 2));
    }
  } catch (e) {
    console.error('[POST_WRAPPER] Failed to parse request:', e);
  }
  
  // Call original mcp-handler
  return handler(request);
}

export { handler as GET, POST_WRAPPER as POST, handler as DELETE };
