/**
 * MCP Tools Configuration
 * Tier-based tool definitions following best practices
 * Version: 1.0.0
 */

export interface ToolDefinition {
  name: string;
  tier: 0 | 1 | 2 | 3 | 4;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * TIER 0 - Core Discovery Tools
 * Keep & tighten; deterministic, fast lookups
 */
export const TIER_0_TOOLS: ToolDefinition[] = [
  {
    name: 'list_components',
    tier: 0,
    description: 'Discoverable inventory of all design system components. Supports fuzzy search and filtering. Call when user asks "what components exist?" or agent needs component names for autocomplete.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional fuzzy search query (prefix/substring matching)'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional filter by component tags/categories'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 50)'
        }
      }
    }
  },
  {
    name: 'get_component_context',
    tier: 0,
    description: 'Single source of truth for using a component in code. Returns import path, props, TypeScript types, usage examples, Figma mapping, design tokens, and accessibility requirements. Call when implementing a component or checking its API.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name (e.g., "Button", "NFTCard")'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'compare_variants',
    tier: 0,
    description: 'Guard-rail for design-code parity. Compares Figma variants vs code props to detect mismatches. Returns deterministic diff showing missing/extra variants. Call before using a variant or during code review.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Component name to compare'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'list_tokens',
    tier: 0,
    description: 'Design token discovery with optional scoping. Returns token names (not raw hex) parsed from tokens.css. Call when agent needs "which spacing tokens?" or "brand colors?"',
    inputSchema: {
      type: 'object',
      properties: {
        scope: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['color', 'spacing', 'typography', 'radius', 'shadow', 'blur']
          },
          description: 'Optional scope filter (e.g., ["color","spacing"])'
        }
      }
    }
  }
];

/**
 * TIER 1 - Bridge Tools (Figma → Design System)
 * Fully deterministic, no LLM
 */
export const TIER_1_TOOLS: ToolDefinition[] = [
  {
    name: 'extract_layout',
    tier: 1,
    description: 'Read layout intent from Figma node (flex/grid/constraints). Pure rule-based extraction. Call before writing container structure.',
    inputSchema: {
      type: 'object',
      properties: {
        figma_node: {
          type: 'object',
          description: 'Figma node object from get_design_context or get_metadata'
        }
      },
      required: ['figma_node']
    }
  },
  {
    name: 'analyze_tokens',
    tier: 1,
    description: 'Map fills/typography/radius/spacing from Figma node to design system tokens. Deterministic nearest-neighbor matching with confidence scores. Call during styling pass or linting.',
    inputSchema: {
      type: 'object',
      properties: {
        figma_node: {
          type: 'object',
          description: 'Figma node object with fills, typography, effects'
        }
      },
      required: ['figma_node']
    }
  },
  {
    name: 'match_components',
    tier: 1,
    description: 'Recognize design system components in Figma subtree using rule signatures (names, constraints, child structure). Predicts variants with confidence scores. Call when analyzing "what components are on this screen?"',
    inputSchema: {
      type: 'object',
      properties: {
        figma_node: {
          type: 'object',
          description: 'Figma node tree to analyze'
        }
      },
      required: ['figma_node']
    }
  }
];

/**
 * TIER 2 - Planning & Scaffolding
 * Deterministic plans; zero LLM inside MCP
 */
export const TIER_2_TOOLS: ToolDefinition[] = [
  {
    name: 'implementation_steps',
    tier: 2,
    description: 'Generate ordered, auditable implementation checklist. Zero LLM. Returns structured steps for imports, props, tokens, and a11y. Call right before codegen.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component name'
        },
        variant: {
          type: 'object',
          description: 'Optional variant configuration'
        }
      },
      required: ['component']
    }
  },
  {
    name: 'scaffold_component',
    tier: 2,
    description: 'Produce structured blueprint (files/imports/templates) for agent to turn into code. Templated & portable. Call when creating new component usage.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component name'
        },
        variant: {
          type: 'object',
          description: 'Optional variant configuration'
        },
        target: {
          type: 'string',
          enum: ['react', 'android', 'ios'],
          description: 'Target platform (default: react)'
        }
      },
      required: ['component']
    }
  },
  {
    name: 'scaffold_screen',
    tier: 2,
    description: 'Multi-component screen blueprint with layout + children. Returns grid/flex structure, component slots, imports, and file templates. Call when implementing Figma frame as a page.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Screen/page name'
        },
        components: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              variant: { type: 'object' }
            },
            required: ['name']
          },
          description: 'Array of components to include'
        }
      },
      required: ['name', 'components']
    }
  }
];

/**
 * TIER 3 - Validation & Linting
 * CI-friendly, no LLM, deterministic
 */
export const TIER_3_TOOLS: ToolDefinition[] = [
  {
    name: 'validate_token_usage',
    tier: 3,
    description: 'Catch hardcoded hex/px values; enforce design system tokens. Returns violations with file/line/fix suggestions. CI-friendly.',
    inputSchema: {
      type: 'object',
      properties: {
        filePaths: {
          type: 'array',
          items: { type: 'string' },
          description: 'File paths to validate'
        }
      },
      required: ['filePaths']
    }
  },
  {
    name: 'validate_a11y_rules',
    tier: 3,
    description: 'Minimal static accessibility checks per component (roles, aria, keyboard). Returns issues with severity levels.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component name'
        },
        code: {
          type: 'string',
          description: 'Optional code string to validate'
        }
      },
      required: ['component']
    }
  },
  {
    name: 'diff_figma_vs_code',
    tier: 3,
    description: 'High-level parity report between Figma and code (variants, sizes, spacing deltas). Deterministic comparison.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component name'
        },
        figma_node: {
          type: 'object',
          description: 'Optional Figma node object for comparison'
        }
      },
      required: ['component']
    }
  }
];

/**
 * TIER 4 - Documentation & Export
 * Nice to have, still deterministic
 */
export const TIER_4_TOOLS: ToolDefinition[] = [
  {
    name: 'generate_docs',
    tier: 4,
    description: 'Emit MD/MDX specification for design system documentation. Structured, template-based output.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component name'
        }
      },
      required: ['component']
    }
  },
  {
    name: 'export_story',
    tier: 4,
    description: 'Output Storybook story skeleton aligned to design system props/variants. Template-based generation.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component name'
        },
        variant: {
          type: 'object',
          description: 'Optional specific variant to export'
        }
      },
      required: ['component']
    }
  }
];

/**
 * All tools combined
 */
export const ALL_TOOLS: ToolDefinition[] = [
  ...TIER_0_TOOLS,
  ...TIER_1_TOOLS,
  ...TIER_2_TOOLS,
  ...TIER_3_TOOLS,
  ...TIER_4_TOOLS
];

/**
 * Tool metadata for responses
 */
export const TOOL_META = {
  version: '1.0.0',
  source: 'skullcandy-mcp',
  tiers: {
    0: 'Core Discovery',
    1: 'Bridge (Figma → DS)',
    2: 'Planning & Scaffolding',
    3: 'Validation & Linting',
    4: 'Documentation & Export'
  }
};
