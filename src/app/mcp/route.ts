/**
 * SkullCandy MCP Server - Refactored Route Handler
 * Tier-based tool architecture with consistent response format
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { ALL_TOOLS } from './tools-config';
import {
  // Tier 0
  handleListComponents,
  handleGetComponentContext,
  handleCompareVariants,
  handleListTokens,
  // Tier 1
  handleExtractLayout,
  handleAnalyzeTokens,
  handleMatchComponents,
  // Tier 2
  handleImplementationSteps,
  handleScaffoldComponent,
  handleScaffoldScreen,
  // Tier 3
  handleValidateTokenUsage,
  handleValidateA11yRules,
  handleDiffFigmaVsCode,
  // Tier 4
  handleGenerateDocs,
  handleExportStory,
} from './tools-handlers';

// Tool name to handler mapping
const TOOL_HANDLERS: Record<string, (args: any) => Promise<any>> = {
  // Tier 0 - Core Discovery
  'list_components': handleListComponents,
  'get_component_context': handleGetComponentContext,
  'compare_variants': handleCompareVariants,
  'list_tokens': handleListTokens,
  // Tier 1 - Bridge (Figma → DS)
  'extract_layout': handleExtractLayout,
  'analyze_tokens': handleAnalyzeTokens,
  'match_components': handleMatchComponents,
  // Tier 2 - Planning & Scaffolding
  'implementation_steps': handleImplementationSteps,
  'scaffold_component': handleScaffoldComponent,
  'scaffold_screen': handleScaffoldScreen,
  // Tier 3 - Validation & Linting
  'validate_token_usage': handleValidateTokenUsage,
  'validate_a11y_rules': handleValidateA11yRules,
  'diff_figma_vs_code': handleDiffFigmaVsCode,
  // Tier 4 - Documentation & Export
  'generate_docs': handleGenerateDocs,
  'export_story': handleExportStory,
};

/**
 * GET /mcp - Health check / Simple tool listing
 */
export async function GET() {
  return NextResponse.json({
    version: '1.0.0',
    source: 'skullcandy-mcp',
    tools: ALL_TOOLS.map(t => t.name),
    count: ALL_TOOLS.length
  });
}

/**
 * POST /mcp - MCP JSON-RPC 2.0 Protocol Handler
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, method, params } = body;

    console.log(`[MCP] JSON-RPC method: ${method}`, params);

    // Handle MCP protocol methods
    switch (method) {
      case 'initialize':
        // MCP initialization handshake
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {}
            },
            serverInfo: {
              name: 'skullcandy-mcp',
              version: '1.0.0'
            }
          }
        });

      case 'tools/list':
        // List all available tools
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            tools: ALL_TOOLS.map(tool => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema
            }))
          }
        });

      case 'tools/call':
        // Execute a tool
        const { name: toolName, arguments: args = {} } = params;
        const handler = TOOL_HANDLERS[toolName];
        
        if (!handler) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Tool not found: ${toolName}`,
              data: { available: Object.keys(TOOL_HANDLERS) }
            }
          });
        }

        const result = await handler(args);
        
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        });

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        });
    }
  } catch (error: any) {
    console.error('[MCP] Error:', error);
    
    return NextResponse.json({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    }, { status: 500 });
  }
}

/**
 * OPTIONS /mcp - CORS support
 */
export async function OPTIONS() {
  return NextResponse.json(
    { ok: true },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
