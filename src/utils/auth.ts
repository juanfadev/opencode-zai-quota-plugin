import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * OpenCode auth configuration paths
 */
const AUTH_PATHS = [
  // Global config
  path.join(os.homedir(), '.config', 'opencode', 'auth.json'),
  // Local share
  path.join(os.homedir(), '.local', 'share', 'opencode', 'auth.json'),
  // Workspace
  path.join(process.cwd(), '.opencode', 'auth.json'),
];

/**
 * Read API key from OpenCode's auth.json
 */
export function getApiKey(): string | undefined {
  for (const authPath of AUTH_PATHS) {
    try {
      if (fs.existsSync(authPath)) {
        const authContent = fs.readFileSync(authPath, 'utf-8');
        const auth = JSON.parse(authContent);

        // Try different provider names
        const possibleKeys = [
          auth.provider?.anthropic?.apiKey,
          auth.provider?.zhipuai?.apiKey,
          auth.provider?.zai?.apiKey,
          auth.provider?.['z.ai']?.apiKey,
          auth.provider?.['z.ai']?.apiKey,
          auth.provider?.['zhipuai']?.apiKey,
          auth.provider?.['z.ai']?.apiKey,
          auth.provider?.glm?.apiKey,
          auth.provider?.['z.ai-glm']?.apiKey,
          auth.provider?.['z.ai-glm']?.apiKey,
          auth.zhipuai?.apiKey,
          auth['z.ai']?.apiKey,
          auth['zhipuai']?.apiKey,
          auth['z.ai-glm']?.apiKey,
          auth['z.ai-glm']?.apiKey,
          auth.provider?.zai?.apiKey,
          auth.provider?.zai?.apiKey,
        ];

        for (const key of possibleKeys) {
          if (key && typeof key === 'string' && key.length > 0) {
            console.debug(`[Auth] Found API key in: ${authPath}`);
            return key;
          }
        }
      }
    } catch (error) {
      // Continue to next path if current fails
      continue;
    }
  }

  return undefined;
}
