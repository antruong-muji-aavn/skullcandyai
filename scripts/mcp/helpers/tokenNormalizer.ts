/**
 * Token Normalizer
 * 
 * Provides truth mapping between Figma, CSS, and MCP-friendly token names.
 * Does NOT modify source code - only provides translation layer for MCP output.
 */

export interface TokenMapping {
  /** Original CSS variable name (as used in code) */
  cssVar: string;
  
  /** MCP-friendly token name (normalized, no special chars) */
  mpcToken: string;
  
  /** Figma variable name (if different from CSS) */
  figmaName?: string;
  
  /** Resolved value */
  value: string;
  
  /** Token category */
  category: 'color' | 'spacing' | 'blur' | 'radius' | 'font' | 'shadow' | 'gradient' | 'other';
  
  /** Figma value if different (e.g., Figma: 200, CSS: 100px) */
  figmaValue?: string;
  
  /** Transformation note */
  note?: string;
}

/**
 * Master token mapping table
 * Maps actual CSS vars (used in code) to MCP-friendly names
 */
export const TOKEN_MAPPINGS: TokenMapping[] = [
  // Blur tokens
  {
    cssVar: '--glass-blur',
    mpcToken: 'blur.glass.100',
    figmaName: 'Glass Blur/Amount',
    value: '100px',
    figmaValue: '200',
    category: 'blur',
    note: 'Figma value divided by 2',
  },
  {
    cssVar: '--backdrop-blur-main',
    mpcToken: 'blur.backdrop.main',
    value: 'blur(100px)',
    category: 'blur',
  },
  {
    cssVar: '--backdrop-blur-100',
    mpcToken: 'blur.backdrop.100',
    value: 'blur(100px)',
    category: 'blur',
  },
  
  // Color tokens - Glass
  {
    cssVar: '--glass-light',
    mpcToken: 'glass.light',
    figmaName: 'Color/ Glass Light',
    value: 'rgba(255, 255, 255, 0.1)',
    figmaValue: '#ffffff1a',
    category: 'color',
  },
  {
    cssVar: '--glass-dark',
    mpcToken: 'glass.dark',
    figmaName: 'Color/ Glass Dark',
    value: 'rgba(0, 0, 0, 0.1)',
    figmaValue: '#0000001a',
    category: 'color',
  },
  {
    cssVar: '--color-glass-light',
    mpcToken: 'color.glass.light',
    value: '#ffffff',
    category: 'color',
  },
  {
    cssVar: '--color-glass-dark',
    mpcToken: 'color.glass.dark',
    value: '#000000',
    category: 'color',
  },
  {
    cssVar: '--color-text',
    mpcToken: 'color.text',
    figmaName: 'Color/Text',
    value: '#ffffff',
    category: 'color',
  },
  {
    cssVar: '--glass-border',
    mpcToken: 'color.glass.border',
    value: '#ffffff',
    category: 'color',
  },
  
  // Radius tokens
  {
    cssVar: '--radius-card',
    mpcToken: 'radius.card',
    figmaName: 'Radius/Card',
    value: '24px',
    figmaValue: '24',
    category: 'radius',
  },
  {
    cssVar: '--radius-button',
    mpcToken: 'radius.button',
    figmaName: 'Radius/Button',
    value: '9999px',
    figmaValue: '9999',
    category: 'radius',
    note: 'Pill shape',
  },
  {
    cssVar: '--radius-pill',
    mpcToken: 'radius.pill',
    value: '9999px',
    category: 'radius',
  },
  {
    cssVar: '--radius-md',
    mpcToken: 'radius.md',
    value: '8px',
    category: 'radius',
  },
  {
    cssVar: '--radius-lg',
    mpcToken: 'radius.lg',
    value: '12px',
    category: 'radius',
  },
  
  // Spacing tokens - Negative margins
  {
    cssVar: '--spacing-negative-6',
    mpcToken: 'space.-6',
    figmaName: '↔️ grid negative/060000 (-48)',
    value: '-48px',
    figmaValue: '-48',
    category: 'spacing',
    note: 'Image overlap top',
  },
  {
    cssVar: '--spacing-negative-3',
    mpcToken: 'space.-3',
    figmaName: '↔️ grid negative/030000 (-24)',
    value: '-24px',
    figmaValue: '-24',
    category: 'spacing',
    note: 'Image overlap bottom',
  },
  
  // Spacing tokens - Positive
  {
    cssVar: '--spacing-xs',
    mpcToken: 'space.xs',
    value: '4px',
    category: 'spacing',
  },
  {
    cssVar: '--spacing-sm',
    mpcToken: 'space.sm',
    value: '8px',
    category: 'spacing',
  },
  {
    cssVar: '--spacing-md',
    mpcToken: 'space.md',
    value: '16px',
    category: 'spacing',
  },
  {
    cssVar: '--spacing-lg',
    mpcToken: 'space.lg',
    value: '24px',
    category: 'spacing',
  },
  {
    cssVar: '--spacing-xl',
    mpcToken: 'space.xl',
    value: '32px',
    category: 'spacing',
  },
  
  // Font family tokens
  {
    cssVar: '--font-family-title',
    mpcToken: 'font.family.title',
    figmaName: 'Font Family/Title',
    value: "'Orbitron', sans-serif",
    figmaValue: 'Orbitron',
    category: 'font',
  },
  {
    cssVar: '--font-family-body',
    mpcToken: 'font.family.body',
    figmaName: 'Font Family/Body',
    value: "'Outfit', sans-serif",
    figmaValue: 'Outfit',
    category: 'font',
  },
  {
    cssVar: '--font-family-button',
    mpcToken: 'font.family.button',
    figmaName: 'Font Family/ Button',
    value: "'Orbitron', sans-serif",
    figmaValue: 'Orbitron',
    category: 'font',
  },
  {
    cssVar: '--font-display',
    mpcToken: 'font.family.display',
    value: "'Orbitron', sans-serif",
    category: 'font',
  },
  {
    cssVar: '--font-body',
    mpcToken: 'font.family.body.alt',
    value: "'Outfit', sans-serif",
    category: 'font',
  },
  
  // Gradient tokens
  {
    cssVar: '--gradient-border-main',
    mpcToken: 'gradient.border.main',
    value: 'linear-gradient(135deg, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0.00) 50%, rgba(255, 255, 255, 0.90) 100%)',
    category: 'gradient',
  },
  {
    cssVar: '--gradient-border-subtle',
    mpcToken: 'gradient.border.subtle',
    value: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.00) 50%, rgba(255, 255, 255, 0.5) 100%)',
    category: 'gradient',
  },
  {
    cssVar: '--button-gradient',
    mpcToken: 'gradient.button.cta',
    value: 'linear-gradient(273deg, rgba(1, 166, 255, 0.70) 2.08%, rgba(132, 235, 127, 0.70) 46.22%, rgba(140, 226, 59, 0.70) 89.23%, rgba(64, 106, 255, 0.70) 108.56%)',
    category: 'gradient',
  },
  
  // Shadow tokens
  {
    cssVar: '--shadow-card',
    mpcToken: 'shadow.card',
    value: '0 8px 32px rgba(0, 0, 0, 0.1)',
    category: 'shadow',
  },
  {
    cssVar: '--shadow-card-hover',
    mpcToken: 'shadow.card.hover',
    value: '0 12px 48px rgba(0, 0, 0, 0.2)',
    category: 'shadow',
  },
];

/**
 * Normalize a CSS variable name to MCP-friendly token name
 * @param cssVar CSS variable (e.g., "--glass-light" or "glass-light")
 * @returns MCP token name (e.g., "glass.light")
 */
export function normalizeCSSVar(cssVar: string): string {
  // Remove leading dashes
  const cleaned = cssVar.replace(/^--/, '');
  
  // Try to find in mapping table
  const mapping = TOKEN_MAPPINGS.find(
    m => m.cssVar === `--${cleaned}` || m.cssVar === cssVar
  );
  
  if (mapping) {
    return mapping.mpcToken;
  }
  
  // Fallback: simple normalization
  return cleaned.replace(/-/g, '.');
}

/**
 * Get CSS variable from MCP token name
 * @param mpcToken MCP token name (e.g., "glass.light")
 * @returns CSS variable (e.g., "--glass-light")
 */
export function getCSSVar(mpcToken: string): string | null {
  const mapping = TOKEN_MAPPINGS.find(m => m.mpcToken === mpcToken);
  return mapping?.cssVar || null;
}

/**
 * Get Figma variable name from CSS variable
 * @param cssVar CSS variable (e.g., "--glass-light")
 * @returns Figma variable name or null
 */
export function getFigmaName(cssVar: string): string | null {
  const mapping = TOKEN_MAPPINGS.find(m => m.cssVar === cssVar);
  return mapping?.figmaName || null;
}

/**
 * Get token mapping by CSS variable
 * @param cssVar CSS variable name
 * @returns Full token mapping or null
 */
export function getTokenMapping(cssVar: string): TokenMapping | null {
  return TOKEN_MAPPINGS.find(m => m.cssVar === cssVar) || null;
}

/**
 * Get all tokens for a specific category
 * @param category Token category
 * @returns Array of token mappings
 */
export function getTokensByCategory(
  category: TokenMapping['category']
): TokenMapping[] {
  return TOKEN_MAPPINGS.filter(m => m.category === category);
}

/**
 * Normalize token names from component tokens array
 * Returns both normalized names and CSS variables for code generation
 */
export interface NormalizedTokens {
  /** MCP-friendly token names */
  names: string[];
  
  /** CSS variables (actual code usage) */
  cssVars: string[];
  
  /** Resolved values (optional) */
  resolved?: Record<string, string>;
  
  /** Figma mappings (optional) */
  figmaMappings?: Record<string, {
    figmaName?: string;
    figmaValue?: string;
    cssVar: string;
    mpcToken: string;
    note?: string;
  }>;
}

/**
 * Normalize an array of component tokens
 * @param tokens Array of CSS variables or token names
 * @param includeValues Whether to include resolved values
 * @param includeFigmaMappings Whether to include Figma mappings
 */
export function normalizeComponentTokens(
  tokens: string[],
  includeValues = true,
  includeFigmaMappings = true
): NormalizedTokens {
  const names: string[] = [];
  const cssVars: string[] = [];
  const resolved: Record<string, string> = {};
  const figmaMappings: Record<string, any> = {};

  for (const token of tokens) {
    const normalized = normalizeCSSVar(token);
    const mapping = getTokenMapping(token) || getTokenMapping(`--${token}`);

    names.push(normalized);
    
    if (mapping) {
      cssVars.push(mapping.cssVar);
      
      if (includeValues) {
        resolved[normalized] = mapping.value;
      }
      
      if (includeFigmaMappings && mapping.figmaName) {
        figmaMappings[normalized] = {
          figmaName: mapping.figmaName,
          figmaValue: mapping.figmaValue,
          cssVar: mapping.cssVar,
          mpcToken: mapping.mpcToken,
          note: mapping.note,
        };
      }
    } else {
      // Fallback for unmapped tokens
      cssVars.push(token.startsWith('--') ? token : `--${token}`);
    }
  }

  return {
    names,
    cssVars,
    ...(includeValues && { resolved }),
    ...(includeFigmaMappings && Object.keys(figmaMappings).length > 0 && { figmaMappings }),
  };
}

/**
 * Sanitize Figma variable name to valid token name
 * Removes emojis, special chars, normalizes spaces/slashes
 */
export function sanitizeFigmaVarName(figmaName: string): string {
  return figmaName
    .replace(/[↔️⬆️⬇️➡️⬅️]/g, '')  // Remove emojis
    .replace(/\s+/g, '-')            // Spaces to hyphens
    .replace(/\//g, '.')             // Slashes to dots
    .replace(/[()]/g, '')            // Remove parentheses
    .replace(/--+/g, '-')            // Collapse multiple hyphens
    .replace(/\.-/g, '.')            // Clean up .-, -., etc
    .replace(/-\./g, '.')
    .toLowerCase()
    .trim();
}
