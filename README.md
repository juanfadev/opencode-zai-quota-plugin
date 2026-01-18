# OpenCode Z.ai GLM Quota Plugin

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/opencode-zai-quota-plugin.svg)](https://www.npmjs.com/package/opencode-zai-quota-plugin)

> OpenCode plugin and CLI tool for checking Z.ai (Zhipu AI) GLM API quota and usage statistics

## Features

- ✅ **Real-time Quota Checking** - Check your Z.ai GLM API usage instantly
- ✅ **OpenCode Integration** - Seamless integration with OpenCode workflows
- ✅ **CLI Tool** - Standalone command-line interface for quick checks
- ✅ **Multiple Output Formats** - Human-readable, JSON, and quiet modes
- ✅ **Intelligent Caching** - Reduces API calls with configurable TTL
- ✅ **Error Handling** - Comprehensive error handling with clear messages
- ✅ **Type-Safe** - Full TypeScript support with Zod validation
- ✅ **Environment Support** - Works with both international and domestic endpoints

## Installation

### Option 1: Install Globally (CLI)
```bash
npm install -g opencode-zai-quota-plugin

# Check quota
zai-quota check

# Show config
zai-quota config

# Clear cache
zai-quota clear-cache
```

### Option 2: Install Locally (as dependency)
```bash
cd your-project
npm install opencode-zai-quota-plugin
```

### Option 3: Install from GitHub
```bash
npm install git+https://github.com/juanfadev/opencode-zai-quota-plugin.git
```

## Usage

### OpenCode Integration (Recommended)

**Setup your Z.ai API key in OpenCode:**

1. Run `opencode` in your terminal
2. Navigate to "Providers" or "API Keys"
3. Add Z.ai (Zhipu AI) with your API key
4. Your key is stored in `~/.local/share/opencode/auth.json`

**After setup, use directly:**

```bash
# No need to pass API key - it reads from OpenCode's auth.json
zai-quota check

# Show configuration
zai-quota config

# Clear cache
zai-quota clear-cache
```

The CLI automatically reads your Z.ai API key from OpenCode's authentication file.

### Using as Library

```bash
# Set API key as environment variable
export ZAI_API_KEY=your_api_key_here

# Check quota
zai-quota check

# Or pass API key directly
zai-quota check --api-key your_api_key_here
```

### Using in TypeScript/JavaScript

```typescript
import { ZaiQuotaAgent } from 'opencode-zai-quota-plugin';

// The agent will automatically use your API key from OpenCode's auth.json
const agent = new ZaiQuotaAgent();

async function checkQuota() {
  const quota = await agent.checkQuota();
  console.log('Sessions remaining:', quota.sessions.remaining);
  console.log('Status:', quota.overallStatus);
}

checkQuota();
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/opencode/opencode-zai-quota-plugin.git
cd opencode-zai-quota-plugin

# Install dependencies
npm install

# Build the project
npm run build
```

## Quick Start

### 1. Get Your API Key

Visit [Zhipu AI Platform](https://open.bigmodel.cn/usercenter/apikeys) to get your API key.

### 2. Set Environment Variable

```bash
export ZAI_API_KEY=your_api_key_here
```

Or create a `.env` file:

```bash
cp .env.example .env
# Edit .env and add your ZAI_API_KEY
```

### 3. Check Quota

#### Using CLI

```bash
# Check current quota status
zai-quota check

# Output as JSON
zai-quota check --json

# Quiet mode (only show alerts)
zai-quota check --quiet

# Force refresh, bypass cache
zai-quota check --force
```

#### Using in TypeScript/JavaScript

```typescript
import { ZaiQuotaAgent } from 'opencode-zai-quota-plugin';

const agent = new ZaiQuotaAgent(process.env.ZAI_API_KEY);

// Get formatted quota information
const formatted = await agent.getFormattedQuota();
console.log(formatted);

// Get quota as structured data
const result = await agent.checkQuota();
console.log('Sessions remaining:', result.sessions.remaining);

// Check if quota is low
const isLow = await agent.isQuotaLow(20); // 20% threshold
if (isLow) {
  console.log('Warning: Quota is low!');
}

// Get quota alerts
const alerts = await agent.getQuotaAlerts({ sessions: 20, mcp: 20 });
alerts.forEach(alert => console.log(alert));
```

## CLI Commands

### `zai-quota check`

Check current quota status.

**Options:**

| Option | Alias | Description | Default |
|---------|--------|-------------|----------|
| `--api-key <key>` | `-k` | API key (overrides env variable) | `process.env.ZAI_API_KEY` |
| `--endpoint <url>` | `-e` | API endpoint URL | `https://api.z.ai/api/monitor/usage/quota/limit` |
| `--force` | `-f` | Force refresh, bypass cache | `false` |
| `--json` | `-j` | Output as JSON | `false` |
| `--quiet` | `-q` | Quiet mode, only show alerts | `false` |
| `--threshold <percent>` | `-t` | Alert threshold percentage | `20` |

**Examples:**

```bash
# Basic check
zai-quota check

# Check with specific API key
zai-quota check --api-key sk-xxx

# JSON output
zai-quota check --json

# Quiet mode (useful for CI/CD)
zai-quota check --quiet --threshold 10
```

### `zai-quota config`

Show current configuration.

**Example:**

```bash
zai-quota config
```

## Configuration

### Environment Variables

| Variable | Required | Description | Default |
|----------|-----------|-------------|----------|
| `ZAI_API_KEY` | Yes | Your Z.ai API key | - |
| `ZAI_ENDPOINT` | No | API endpoint URL | `https://api.z.ai/api/monitor/usage/quota/limit` |
| `ZAI_TIMEOUT` | No | Request timeout in milliseconds | `10000` |
| `ZAI_CACHE_ENABLED` | No | Enable caching | `true` |
| `ZAI_CACHE_TTL` | No | Cache TTL in seconds | `300` |
| `LOG_LEVEL` | No | Log level (debug, info, warn, error) | `info` |

### API Endpoints

**International (Global):**
```
https://api.z.ai/api/monitor/usage/quota/limit
```

**Domestic (China):**
```
https://open.bigmodel.cn/api/monitor/usage/quota/limit
```

## API Response Format

The plugin returns the following data structure:

```typescript
{
  sessions: {
    used: number;        // Sessions used
    total: number;       // Total sessions available
    remaining: number;    // Sessions remaining
    percentage: number;   // Percentage remaining
    status: string;       // Status indicator (Good, Moderate, Low, Critical)
  };
  mcp: {
    used: number;
    total: number;
    remaining: number;
    percentage: number;
    status: string;
  };
  mcpTimeLimit: {
    used: number;        // Time used in seconds
    total: number;       // Total time limit in seconds
    remaining: number;
    percentage: number;
    status: string;
  };
  overallStatus: string;
  timestamp: string;
}
```

## Usage Examples

### Example 1: Basic Usage

```typescript
import { ZaiQuotaAgent } from 'opencode-zai-quota-plugin';

const agent = new ZaiQuotaAgent();
const result = await agent.checkQuota();
console.log(result);
```

### Example 2: Custom Endpoint and Configuration

```typescript
import { ZaiQuotaAgent, ZaiEndpoint } from 'opencode-zai-quota-plugin';

const agent = new ZaiQuotaAgent(
  'sk-xxx',
  ZaiEndpoint.DOMESTIC
);

const quota = await agent.checkQuota();
console.log(quota);
```

### Example 3: Alert Integration

```typescript
import { ZaiQuotaAgent } from 'opencode-zai-quota-plugin';

const agent = new ZaiQuotaAgent();

// Check if any quota is below 15%
const isLow = await agent.isQuotaLow(15);

if (isLow) {
  // Get specific alerts
  const alerts = await agent.getQuotaAlerts({
    sessions: 15,
    mcp: 15,
    mcpTimeLimit: 15
  });

  // Send alerts (e.g., email, Slack, etc.)
  alerts.forEach(alert => {
    console.log('ALERT:', alert);
    // Send to notification service
  });
}
```

### Example 4: Periodic Monitoring

```typescript
import { ZaiQuotaAgent } from 'opencode-zai-quota-plugin';

const agent = new ZaiQuotaAgent();

// Check every hour
setInterval(async () => {
  const result = await agent.checkQuota();

  if (result.overallStatus.includes('Low') || result.overallStatus.includes('Critical')) {
    // Send alert
    console.log('Quota Alert:', await agent.getFormattedQuota());
  }
}, 60 * 60 * 1000); // Every hour
```

## OpenCode Integration

This plugin can be used as an OpenCode agent or skill:

### Agent Integration

```typescript
import { ZaiQuotaAgent } from 'opencode-zai-quota-plugin';

// The agent can be invoked by OpenCode's agent system
const agent = new ZaiQuotaAgent();

// Check quota with force refresh
const result = await agent.checkQuota({ forceRefresh: true });
```

## Error Handling

The plugin provides detailed error handling:

```typescript
import {
  ZaiQuotaError,
  ZaiAuthenticationError,
  ZaiRateLimitError
} from 'opencode-zai-quota-plugin';

try {
  const result = await agent.checkQuota();
} catch (error) {
  if (error instanceof ZaiAuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof ZaiRateLimitError) {
    console.error('Rate limit exceeded, retry after:', error.retryAfter);
  } else if (error instanceof ZaiQuotaError) {
    console.error('Quota error:', error.message, error.code);
  }
}
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Development

### Project Structure

```
opencode-zai-quota-plugin/
├── src/
│   ├── core/                    # Core functionality
│   │   ├── ZaiQuotaClient.ts   # Main API client
│   │   ├── ZaiQuotaResponse.ts # Response models
│   │   ├── ZaiConfig.ts        # Configuration
│   │   ├── ZaiError.ts         # Error classes
│   │   └── ZaiCache.ts        # Caching mechanism
│   ├── integrations/
│   │   ├── opencode/           # OpenCode integration
│   │   └── cli/               # CLI implementation
│   └── utils/                 # Utilities
├── tests/                      # Test suite
│   ├── unit/
│   ├── integration/
│   └── mocks/
└── examples/                   # Usage examples
```

### Build

```bash
npm run build
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © 2026 OpenCode Community

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/opencode/opencode-zai-quota-plugin/issues)
- 💬 [Discussions](https://github.com/opencode/opencode-zai-quota-plugin/discussions)

## Acknowledgments

- Built with TypeScript and Zod for type safety
- Inspired by [CodexBar](https://github.com/steipete/CodexBar) and [ClaudeBar](https://github.com/tddworks/ClaudeBar)
- API integration based on Zhipu AI's official documentation

## Related Projects

- [zai-coding-plugins](https://github.com/zai-org/zai-coding-plugins) - VS Code plugins for GLM Coding Plan
- [CodexBar](https://github.com/steipete/CodexBar) - Menu bar app for API quota tracking
- [ClaudeBar](https://github.com/tddworks/ClaudeBar) - Claude API monitoring

---

Made with ❤️ by the OpenCode Community
