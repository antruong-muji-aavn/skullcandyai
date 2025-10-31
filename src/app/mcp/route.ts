import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import componentsData from '@/../../data/components.json';
import tokensData from '@/../../data/tokens.json';

// Helper function to analyze Figma context and suggest components
function analyzeAndSuggestComponents(figmaContext: any): any[] {
  const suggestions: any[] = [];
  
  // Extract useful info from Figma context
  const nodeName = figmaContext.name?.toLowerCase() || '';
  const hasText = figmaContext.characters || figmaContext.text;
  const hasImage = figmaContext.fills?.some((f: any) => f.type === 'IMAGE');
  const isButton = nodeName.includes('button') || nodeName.includes('btn');
  const isCard = nodeName.includes('card');
  const isInput = nodeName.includes('input') || nodeName.includes('search');
  const isNavigation = nodeName.includes('nav') || nodeName.includes('menu');
  
  // Match patterns with our components
  const componentKeys = Object.keys(componentsData);
  
  componentKeys.forEach((componentName) => {
    const component = (componentsData as any)[componentName];
    let matchScore = 0;
    let matchReasons: string[] = [];
    
    // Button matching
    if (componentName === 'Button' && isButton) {
      matchScore = 90;
      matchReasons.push('Node name contains "button"');
      if (hasText) matchReasons.push('Has text content');
    }
    
    // NFTCard matching
    if (componentName === 'NFTCard' && (isCard || hasImage)) {
      matchScore = 85;
      if (isCard) matchReasons.push('Node name contains "card"');
      if (hasImage) matchReasons.push('Contains image');
    }
    
    // SearchBar matching
    if (componentName === 'SearchBar' && isInput) {
      matchScore = 90;
      matchReasons.push('Node name suggests input/search');
    }
    
    // Navbar matching
    if (componentName === 'Navbar' && isNavigation) {
      matchScore = 85;
      matchReasons.push('Node name suggests navigation');
    }
    
    // Add more component matching logic...
    
    if (matchScore > 0) {
      suggestions.push({
        component: componentName,
        matchScore,
        matchReasons,
        import: component.import,
        props: component.props,
        examples: component.examples,
        usage: generateUsageExample(componentName, component, figmaContext),
      });
    }
  });
  
  // Sort by match score
  suggestions.sort((a, b) => b.matchScore - a.matchScore);
  
  return suggestions.slice(0, 5); // Return top 5 matches
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

    // Tool 5: Suggest components from Figma selection
    server.tool(
      'suggest_components_from_figma',
      'Analyze selected Figma frame and suggest matching components from design system. Requires Figma desktop app to be open with a frame selected.',
      {
        nodeId: z
          .string()
          .optional()
          .describe('Optional Figma node ID. If not provided, uses currently selected node in Figma.'),
      },
      async ({ nodeId }) => {
        try {
          // Call Figma MCP to get design context
          const figmaUrl = 'http://127.0.0.1:3845/mcp';
          
          // Step 1: Get design context from Figma
          const designContextResponse = await fetch(figmaUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'tools/call',
              params: {
                name: 'get_design_context',
                arguments: nodeId ? { nodeId } : {},
              },
            }),
          });

          if (!designContextResponse.ok) {
            throw new Error(`Figma MCP request failed: ${designContextResponse.statusText}`);
          }

          const figmaData = await designContextResponse.json();
          
          if (figmaData.error) {
            throw new Error(`Figma MCP error: ${figmaData.error.message}`);
          }

          // Extract design context from Figma response
          const designContext = figmaData.result?.content?.[0]?.text;
          if (!designContext) {
            throw new Error('No design context returned from Figma');
          }

          let parsedContext: any;
          try {
            parsedContext = JSON.parse(designContext);
          } catch {
            parsedContext = { raw: designContext };
          }

          // Step 2: Analyze and match with our components
          const suggestions = analyzeAndSuggestComponents(parsedContext);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    meta: { version: '0.1.0', source: 'skullcandy-mcp' },
                    data: {
                      figmaContext: parsedContext,
                      suggestions,
                    },
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          throw new Error(
            `Failed to fetch Figma context: ${error instanceof Error ? error.message : 'Unknown error'}`
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

export { handler as GET, handler as POST, handler as DELETE };
