/**
 * Token Data Loader
 * Loads design tokens from data/tokens.json
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface Tokens {
  colors?: Record<string, string>;
  spacing?: Record<string, string>;
  typography?: Record<string, any>;
  radius?: Record<string, string>;
  shadow?: Record<string, string>;
  blur?: Record<string, string>;
  [key: string]: any;
}

let cachedTokens: Tokens | null = null;

export async function getTokens(): Promise<Tokens> {
  if (cachedTokens) {
    return cachedTokens;
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'tokens.json');
    const content = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(content);
    
    cachedTokens = data;
    return cachedTokens as Tokens;
  } catch (error) {
    console.error('[getTokens] Error:', error);
    cachedTokens = {};
    return {};
  }
}

export function clearTokensCache() {
  cachedTokens = null;
}
