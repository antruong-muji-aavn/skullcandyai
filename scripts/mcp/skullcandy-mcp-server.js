#!/usr/bin/env node

/**
 * SkullCandy MCP Server - Native STDIO Implementation
 * 
 * This server provides the enhanced suggest_components_from_figma tool
 * as a native MCP server that integrates directly with VS Code Copilot.
 * 
 * It communicates via STDIO using the MCP protocol and calls the Next.js
 * HTTP endpoint internally to leverage the enhanced analysis logic.
 */

const http = require('http');

const MCP_VERSION = '2024-11-05';
const SERVER_NAME = 'skullcandy-mcp';
const SERVER_VERSION = '0.3.0';
const API_BASE = 'http://127.0.0.1:3000'; // Next.js dev server

/**
 * Tool definitions - Tier-based architecture
 * All 15 tools across 5 tiers
 */
const TOOLS = [
  // TIER 0 - Core Discovery
  {
    name: 'list_components',
    description: 'Discoverable inventory of all design system components. Supports fuzzy search and filtering. Call when user asks "what components exist?" or agent needs component names.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Fuzzy search query' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
        limit: { type: 'number', description: 'Max results (default: 50)' }
      }
    }
  },
  {
    name: 'get_component_context',
    description: 'Single source of truth for using a component. Returns import, props, examples, Figma mapping, tokens, and a11y requirements.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Component name (e.g., "Button")' }
      },
      required: ['name']
    }
  },
  {
    name: 'compare_variants',
    description: 'Guard-rail for design-code parity. Compares Figma variants vs code props. Returns deterministic diff.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Component name' }
      },
      required: ['name']
    }
  },
  {
    name: 'list_tokens',
    description: 'Design token discovery with scoping. Returns token names from tokens.css.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'array', items: { type: 'string', enum: ['color', 'spacing', 'typography', 'radius', 'shadow', 'blur'] } }
      }
    }
  },
  // TIER 1 - Bridge (Figma → DS)
  {
    name: 'extract_layout',
    description: 'Read layout intent from Figma node (flex/grid/constraints). Pure rule-based.',
    inputSchema: {
      type: 'object',
      properties: {
        figma_node: { type: 'object', description: 'Figma node object' }
      },
      required: ['figma_node']
    }
  },
  {
    name: 'analyze_tokens',
    description: 'Map fills/typography/radius/spacing from Figma to DS tokens. Deterministic with confidence scores.',
    inputSchema: {
      type: 'object',
      properties: {
        figma_node: { type: 'object', description: 'Figma node with fills, typography, effects' }
      },
      required: ['figma_node']
    }
  },
  {
    name: 'match_components',
    description: 'Recognize DS components in Figma subtree using rule signatures. Predicts variants with confidence.',
    inputSchema: {
      type: 'object',
      properties: {
        figma_node: { type: 'object', description: 'Figma node tree' }
      },
      required: ['figma_node']
    }
  },
  // TIER 2 - Planning & Scaffolding
  {
    name: 'implementation_steps',
    description: 'Generate ordered implementation checklist. Zero LLM. Returns structured steps.',
    inputSchema: {
      type: 'object',
      properties: {
        component: { type: 'string' },
        variant: { type: 'object' }
      },
      required: ['component']
    }
  },
  {
    name: 'scaffold_component',
    description: 'Produce structured blueprint for component. Templated & portable.',
    inputSchema: {
      type: 'object',
      properties: {
        component: { type: 'string' },
        variant: { type: 'object' },
        target: { type: 'string', enum: ['react', 'android', 'ios'] }
      },
      required: ['component']
    }
  },
  {
    name: 'scaffold_screen',
    description: 'Multi-component screen blueprint with layout + children.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        components: { type: 'array' }
      },
      required: ['name', 'components']
    }
  },
  // TIER 3 - Validation & Linting
  {
    name: 'validate_token_usage',
    description: 'Catch hardcoded hex/px; enforce DS tokens. CI-friendly.',
    inputSchema: {
      type: 'object',
      properties: {
        filePaths: { type: 'array', items: { type: 'string' } }
      },
      required: ['filePaths']
    }
  },
  {
    name: 'validate_a11y_rules',
    description: 'Static accessibility checks per component (roles, aria, keyboard).',
    inputSchema: {
      type: 'object',
      properties: {
        component: { type: 'string' },
        code: { type: 'string' }
      },
      required: ['component']
    }
  },
  {
    name: 'diff_figma_vs_code',
    description: 'High-level parity report (variants, sizes, spacing deltas).',
    inputSchema: {
      type: 'object',
      properties: {
        component: { type: 'string' },
        figma_node: { type: 'object' }
      },
      required: ['component']
    }
  },
  // TIER 4 - Documentation & Export
  {
    name: 'generate_docs',
    description: 'Emit MD/MDX specification for DS documentation.',
    inputSchema: {
      type: 'object',
      properties: {
        component: { type: 'string' }
      },
      required: ['component']
    }
  },
  {
    name: 'export_story',
    description: 'Output Storybook story skeleton aligned to DS props/variants.',
    inputSchema: {
      type: 'object',
      properties: {
        component: { type: 'string' },
        variant: { type: 'object' }
      },
      required: ['component']
    }
  }
];

/**
 * Call the Next.js HTTP endpoint
 */
function callNextJsAPI(toolName, toolArgs = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      tool: toolName,
      arguments: toolArgs
    });

    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          // Handle SSE format if needed
          if (body.startsWith('data: ')) {
            const lines = body.split('\n').filter(line => line.startsWith('data: '));
            const lastLine = lines[lines.length - 1];
            const jsonData = lastLine.replace('data: ', '');
            resolve(JSON.parse(jsonData));
          } else {
            resolve(JSON.parse(body));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`HTTP request failed: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
}

/**
 * Handle MCP protocol requests
 */
async function handleRequest(request) {
  const { method, params } = request;

  try {
    switch (method) {
      case 'initialize':
        return {
          protocolVersion: MCP_VERSION,
          serverInfo: {
            name: SERVER_NAME,
            version: SERVER_VERSION
          },
          capabilities: {
            tools: {}
          }
        };

      case 'tools/list':
        return {
          tools: TOOLS
        };

      case 'tools/call':
        const { name, arguments: args } = params;
        
        // Validate tool exists
        const validTools = TOOLS.map(t => t.name);
        if (!validTools.includes(name)) {
          throw new Error(`Unknown tool: ${name}. Available: ${validTools.join(', ')}`);
        }

        // Call the Next.js endpoint with tool name and arguments
        const result = await callNextJsAPI(name, args || {});
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };

      case 'ping':
        return {};

      default:
        throw new Error(`Unknown method: ${method}`);
    }
  } catch (error) {
    console.error(`[${SERVER_NAME}] Error handling request:`, error);
    throw error;
  }
}

/**
 * Main STDIO handler
 */
async function main() {
  console.error(`[${SERVER_NAME}] Starting v${SERVER_VERSION}`);
  console.error(`[${SERVER_NAME}] Connecting to Next.js at ${API_BASE}`);
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    try {
      const request = JSON.parse(line);
      console.error(`[${SERVER_NAME}] Received: ${request.method}`);
      
      const response = await handleRequest(request);
      
      const output = JSON.stringify({
        jsonrpc: '2.0',
        id: request.id,
        result: response
      });
      
      console.log(output);
    } catch (error) {
      console.error(`[${SERVER_NAME}] Error:`, error);
      
      const errorResponse = JSON.stringify({
        jsonrpc: '2.0',
        id: request?.id || null,
        error: {
          code: -32603,
          message: error.message
        }
      });
      
      console.log(errorResponse);
    }
  });

  rl.on('close', () => {
    console.error(`[${SERVER_NAME}] Shutting down`);
    process.exit(0);
  });

  process.on('SIGINT', () => {
    console.error(`[${SERVER_NAME}] Received SIGINT`);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.error(`[${SERVER_NAME}] Received SIGTERM`);
    process.exit(0);
  });
}

// Start the server
if (require.main === module) {
  main().catch((error) => {
    console.error(`[${SERVER_NAME}] Fatal error:`, error);
    process.exit(1);
  });
}

module.exports = { handleRequest, TOOLS };
