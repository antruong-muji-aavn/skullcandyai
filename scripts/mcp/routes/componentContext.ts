import { Router, Request, Response } from 'express';
import { getComponent } from '../helpers/components';
import { normalizeComponentTokens } from '../helpers/tokenNormalizer';

const router = Router();

/**
 * GET /component-context?name=<Component>
 * Returns merged component info: code, figma, tokens
 */
router.get('/', (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      meta: { version: '0.2.0', source: 'skullcandy-mcp' },
      error: 'Missing or invalid "name" query parameter',
    });
  }

  const component = getComponent(name);

  if (!component) {
    return res.status(404).json({
      meta: { version: '0.2.0', source: 'skullcandy-mcp' },
      error: `Component "${name}" not found`,
    });
  }

  // Normalize tokens for MCP output
  const normalizedTokens = normalizeComponentTokens(
    component.tokens || [],
    true,  // includeValues
    true   // includeFigmaMappings
  );

  return res.json({
    meta: { version: '0.2.0', source: 'skullcandy-mcp' },
    component: {
      name,
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
});

export default router;
