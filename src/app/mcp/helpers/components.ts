/**
 * Component Data Loader
 * Loads component definitions from data/components.json
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface Component {
  name: string;
  id: string;
  import: string;
  props?: Record<string, any>;
  variants?: Record<string, any>;
  figmaFileId?: string;
  figmaNodeId?: string;
  figmaVariants?: string[];
  tags?: string[];
  example?: string;
  tokens?: string[];
  a11y?: {
    role?: string;
    aria?: string[];
    keyboard?: string[];
  };
}

let cachedComponents: Component[] | null = null;

export async function loadComponents(): Promise<Component[]> {
  if (cachedComponents) {
    return cachedComponents;
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'components.json');
    const content = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(content);
    
    // Convert object structure { "Button": {...}, "NFTCard": {...} } to array
    if (typeof data === 'object' && !Array.isArray(data)) {
      cachedComponents = Object.entries(data).map(([name, component]: [string, any]) => ({
        name,
        id: name.toLowerCase().replace(/\s+/g, '-'),
        import: component.import || `@/components/${name.toLowerCase()}`,
        props: component.props || {},
        variants: component.figma?.variants || {},
        figmaVariants: component.figma?.variants 
          ? (Object.values(component.figma.variants).flat() as string[])
          : [],
        tags: component.tags || [],
        example: component.examples?.[0] || '',
        tokens: component.tokens || [],
        a11y: component.a11y || {}
      }));
    } else {
      cachedComponents = data.components || data || [];
    }
    
    return cachedComponents as Component[];
  } catch (error) {
    console.error('[loadComponents] Error:', error);
    cachedComponents = [];
    return [];
  }
}

export function clearComponentsCache() {
  cachedComponents = null;
}
