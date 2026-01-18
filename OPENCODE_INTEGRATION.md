# OpenCode Integration Implementation

## Summary

The `opencode-zai-quota-plugin` now integrates with OpenCode's authentication system.

## How It Works

1. **Reads from OpenCode's auth.json**: The plugin automatically checks `~/.local/share/opencode/auth.json` for your Z.ai API key.

2. **Multiple provider support**: Supports various key formats including:
   - `provider.zhipuai.apiKey` (Zhipu AI's naming)
   - `provider.z.ai.apiKey` (Alternative naming)
   - `provider["z.ai"].apiKey` (Bracket notation)
   - Environment variable: `ZAI_API_KEY`

3. **Graceful degradation**: If no API key is found in OpenCode's auth.json:
   - Shows helpful error message
   - Provides clear setup instructions
   - Supports command-line override

## File Structure

```
src/
├── utils/
│   └── auth.ts              # Reads OpenCode's auth.json
├── core/
│   └── ZaiConfig.ts       # Uses getApiKeyFromAuth() to read keys
├── integrations/
│   └── cli/
│       └── ZaiQuotaCLI.ts  # Uses getApiKey() in constructor
```

## Configuration Hierarchy (Priority Order)

1. `--api-key` option (highest priority)
2. OpenCode's auth.json (provider.zhipuai.apiKey)
3. Environment variable: `ZAI_API_KEY`
4. Fallback to undefined (will trigger config validation error)

## Usage Examples

### 1. After OpenCode Setup (Recommended)
```bash
# Just run CLI - it will read from OpenCode's auth.json
zai-quota check
```

### 2. With Environment Variable
```bash
export ZAI_API_KEY=your_actual_key_here
zai-quota check
```

### 3. With CLI Option
```bash
zai-quota check --api-key your_actual_key_here
```

## Testing

```bash
# Test without key (should show helpful error)
zai-quota check

# Test with environment variable
export ZAI_API_KEY=test
zai-quota config
```

## Files Changed

- `src/utils/auth.ts` - Added OpenCode auth.json reading logic
- `src/core/ZaiConfig.ts` - Added getApiKeyFromAuth() import and usage
- `src/integrations/cli/ZaiQuotaCLI.ts` - Added getApiKey() import and improved error handling
- `SKILL.md` - OpenCode skill documentation
- `README.md` - Added OpenCode integration section
- `package.json` - Updated description

## How This Matches Other OpenCode Plugins

Similar to how plugins like `opencode-mystatus` and `opencode-openai-codex-auth` work:

1. **Provider-based key access**: They read from `provider.<name>.apiKey`
2. **Multiple fallback strategies**: Environment variables, direct options
3. **Clear user guidance**: When auth fails, plugins provide setup instructions

## Next Steps

The plugin is now ready to:
1. Be installed from OpenCode by placing in `.opencode/skill/` or `.opencode/plugin/`
2. Be invoked via OpenCode's agent system
3. Work seamlessly with OpenCode's provider management

## For Users

Just install the CLI globally and run:
```bash
npm install -g opencode-zai-quota-plugin
```

Then setup your Z.ai key in OpenCode (CLI: `opencode connect`) and the CLI will automatically use it.
