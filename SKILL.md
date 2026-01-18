# Skill: Z.ai Quota Checker

Check your Z.ai (Zhipu AI) GLM API quota and usage statistics.

## Usage

/skill zai-quota check

## Options

- `--force`: Force refresh, bypass cache
- `--threshold <n>`: Alert threshold percentage (default: 20)

## Output

Quota status for sessions, MCP calls, and time limits with visual indicators.

## Implementation

This skill uses the `zai-quota` CLI tool which reads API keys from OpenCode's `~/.local/share/opencode/auth.json` file.

## Configuration

To use this skill, you need to configure your Z.ai API key in one of two ways:

1. **Via OpenCode CLI**:
   ```bash
   opencode connect
   # Select "Z.ai (Zhipu AI)" and enter your API key
   ```

2. **Manually edit auth.json**:
   ```bash
   # Edit OpenCode's auth file
   nano ~/.local/share/opencode/auth.json

   # Add your Z.ai key:
   {
     "provider": {
       "zhipuai": {
         "apiKey": "your_api_key_here"
       }
     }
   }
   ```

3. **Set environment variable** (fallback):
   ```bash
   export ZAI_API_KEY=your_api_key_here
   ```

The skill will automatically search for API keys in this order:
1. OpenCode's `~/.local/share/opencode/auth.json` (primary)
2. Environment variables
3. Direct `--api-key` option
