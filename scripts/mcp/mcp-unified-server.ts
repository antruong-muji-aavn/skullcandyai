import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { loadComponents } from './helpers/components';
import { getTokens } from './helpers/tokens';
import { normalizeComponentTokens } from './helpers/tokenNormalizer';
// Import all tools from Next.js config (shared definition)
import { ALL_TOOLS } from '../../src/app/mcp/tools-config';
// Import all tool handlers from Next.js (shared implementation)
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
} from '../../src/app/mcp/tools-handlers';

const MCP_VERSION = '2024-11-05';
const SERVER_NAME = 'skullcandy-mcp-server';
const SERVER_VERSION = '0.2.0';
const PORT = process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : 3001;

// Use the same tool definitions as Next.js MCP
const TOOLS = ALL_TOOLS;

// Tool name to handler mapping (same as Next.js)
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
 * Handle MCP JSON-RPC requests
 */
async function handleMCPRequest(request: any, _req: Request): Promise<any> {
  const { method, params } = request;

  switch (method) {
    case 'initialize':
      return {
        protocolVersion: MCP_VERSION,
        serverInfo: {
          name: SERVER_NAME,
          version: SERVER_VERSION,
        },
        capabilities: {
          tools: {},
        },
      };

    case 'tools/list':
      return { tools: TOOLS };

    case 'tools/call': {
      const { name, arguments: args = {} } = params;

      try {
        // Use shared tool handlers (same as Next.js)
        const handler = TOOL_HANDLERS[name];
        
        if (!handler) {
          throw new Error(`Unknown tool: ${name}. Available tools: ${Object.keys(TOOL_HANDLERS).join(', ')}`);
        }

        const result = await handler(args);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    default:
      throw new Error(`Unknown method: ${method}`);
  }
}

// Create Express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request timeout middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(5000);
  res.setTimeout(5000);
  next();
});

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// MCP endpoint - handles JSON-RPC requests
app.post('/mcp', async (req: Request, res: Response) => {
  try {
    const request = req.body;
    console.log(`[MCP] ${request.method}`, request.params ? JSON.stringify(request.params).substring(0, 50) : '');

    // Handle notifications (no id, no response needed)
    if (request.method?.startsWith('notifications/')) {
      console.log(`[MCP] Notification acknowledged: ${request.method}`);
      res.json({ jsonrpc: '2.0', result: null });
      return;
    }

    const result = await handleMCPRequest(request, req);

    const response = {
      jsonrpc: '2.0',
      id: request.id,
      result,
    };

    res.json(response);
  } catch (error: any) {
    console.error('[MCP] Error:', error.message);
    const errorResponse = {
      jsonrpc: '2.0',
      id: req.body.id || null,
      error: {
        code: -32603,
        message: error.message,
      },
    };
    res.status(500).json(errorResponse);
  }
});

// REST API Routes (for direct access)
app.get('/component-context', (req: Request, res: Response) => {
  try {
    const componentName = req.query.name as string;
    if (!componentName) {
      return res.status(400).json({
        meta: { version: SERVER_VERSION, source: 'skullcandy-mcp' },
        error: 'Missing required parameter: name'
      });
    }

    const components = loadComponents();
    const component = components[componentName];

    if (!component) {
      return res.status(404).json({
        meta: { version: SERVER_VERSION, source: 'skullcandy-mcp' },
        error: `Component not found: ${componentName}`
      });
    }

    // Normalize tokens for MCP output
    const normalizedTokens = normalizeComponentTokens(
      component.tokens || [],
      true,  // includeValues
      true   // includeFigmaMappings
    );

    res.json({
      meta: { version: SERVER_VERSION, source: 'skullcandy-mcp' },
      component: {
        name: componentName,
        import: component.import,
        props: component.props,
        examples: component.examples || [],
        figma: component.figma || {},
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
  } catch (error: any) {
    res.status(500).json({ 
      meta: { version: SERVER_VERSION, source: 'skullcandy-mcp' },
      error: error.message 
    });
  }
});

app.get('/list-components', (_req: Request, res: Response) => {
  try {
    const components = loadComponents();
    res.json({
      meta: { version: SERVER_VERSION, source: 'skullcandy-mcp' },
      data: {
        components: Object.keys(components),
        count: Object.keys(components).length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/list-tokens', (req: Request, res: Response) => {
  try {
    const scope = req.query.scope as string;
    const tokens = getTokens(scope);
    res.json({
      meta: { version: SERVER_VERSION, source: 'skullcandy-mcp' },
      data: {
        scope: scope || 'all',
        tokens,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/compare-variants', (req: Request, res: Response) => {
  try {
    const componentName = req.query.name as string;
    if (!componentName) {
      return res.status(400).json({ error: 'Missing required parameter: name' });
    }

    const components = loadComponents();
    const component = components[componentName];

    if (!component) {
      return res.status(404).json({ error: `Component not found: ${componentName}` });
    }

    const figmaVariants = component.figma?.variants || {};
    const codeProps = component.props || {};

    res.json({
      meta: { version: SERVER_VERSION, source: 'skullcandy-mcp' },
      data: {
        component: componentName,
        figma: figmaVariants,
        code: codeProps,
        comparison: {
          figmaOnly: Object.keys(figmaVariants).filter((k: string) => !codeProps[k]),
          codeOnly: Object.keys(codeProps).filter((k: string) => !figmaVariants[k]),
          shared: Object.keys(figmaVariants).filter((k: string) => codeProps[k]),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: SERVER_NAME,
    version: SERVER_VERSION,
    protocols: ['MCP over HTTP', 'REST API'],
    endpoints: {
      mcp: '/mcp (POST)',
      rest: [
        'GET /component-context?name=<Component>',
        'GET /list-components',
        'GET /list-tokens?scope=<scope>',
        'GET /compare-variants?name=<Component>',
      ],
    },
    status: 'running',
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    meta: { version: SERVER_VERSION, source: 'skullcandy-mcp' },
    status: 'error',
    message: err.message,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎨 SkullCandy Unified MCP + REST Server');
  console.log('='.repeat(60));
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`\n📋 MCP Protocol (VS Code):`);
  console.log(`   POST http://localhost:${PORT}/mcp`);
  console.log(`\n📋 REST API (Direct):`);
  console.log(`   GET  http://localhost:${PORT}/list-components`);
  console.log(`   GET  http://localhost:${PORT}/component-context?name=Button`);
  console.log(`   GET  http://localhost:${PORT}/list-tokens?scope=color`);
  console.log(`   GET  http://localhost:${PORT}/compare-variants?name=Button`);
  console.log('\n💡 VS Code configuration:');
  console.log('   {');
  console.log('     "skullcandy-mcp-server": {');
  console.log(`       "url": "http://127.0.0.1:${PORT}/mcp",`);
  console.log('       "type": "http"');
  console.log('     }');
  console.log('   }');
  console.log('='.repeat(60) + '\n');
});

// Set server timeout
server.timeout = 5000;
server.keepAliveTimeout = 5000;
server.headersTimeout = 5100;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing server');
  server.close(() => {
    console.log('Server closed');
  });
});

export default app;
