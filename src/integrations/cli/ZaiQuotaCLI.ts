#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ZaiQuotaAgent } from '../opencode/ZaiQuotaAgent';
import { ZaiQuotaError, ZaiAuthenticationError, ZaiConfig } from '../../core/ZaiQuotaClient';
import { getApiKey } from '../../utils/auth';

const program = new Command();

program
  .name('zai-quota')
  .description('Check Z.ai GLM API quota and usage')
  .version('1.0.0');

program
  .command('check')
  .description('Check current quota status')
  .option('-k, --api-key <key>', 'API key (overrides env variable)')
  .option('-e, --endpoint <url>', 'API endpoint URL')
  .option('-f, --force', 'Force refresh, bypass cache')
  .option('-j, --json', 'Output as JSON')
  .option('-q, --quiet', 'Quiet mode, only show alerts')
  .option('-t, --threshold <percent>', 'Alert threshold percentage', '20')
  .action(async (options) => {
    const spinner = ora('Checking quota...').start();

    try {
      const agent = new ZaiQuotaAgent(
        options.apiKey || getApiKey(),
        options.endpoint
      );

      const result = await agent.checkQuota({ forceRefresh: options.force });

      spinner.stop();

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else if (options.quiet) {
        const alerts = await agent.getQuotaAlerts({
          sessions: parseInt(options.threshold, 10),
        });

        if (alerts.length > 0) {
          console.log(chalk.yellow('\n⚠️  Quota Alerts:'));
          alerts.forEach(alert => console.log(`  ${alert}`));
        } else {
          console.log(chalk.green('✅ All quotas above threshold'));
        }
      } else {
        console.log(chalk.cyan(await agent.getFormattedQuota()));

        const alerts = await agent.getQuotaAlerts({
          sessions: parseInt(options.threshold, 10),
        });

        if (alerts.length > 0) {
          console.log(chalk.yellow('\n⚠️  Quota Alerts:'));
          alerts.forEach(alert => console.log(`  ${alert}`));
        }
      }

      process.exit(0);
    } catch (error) {
      spinner.stop();

      if (error instanceof ZaiAuthenticationError) {
        console.error(chalk.red(`\n❌ Authentication Error: ${error.message}`));
        console.error(chalk.yellow('Please check your API key in ZAI_API_KEY environment variable.'));
      } else if (error instanceof ZaiQuotaError) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
      } else if (error instanceof Error) {
        console.error(chalk.red(`\n❌ Error: ${error.message}`));
      } else {
        console.error(chalk.red('\n❌ Unknown error occurred'));
      }

      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    try {
      const apiKey = getApiKey();
      if (apiKey) {
        const config = new ZaiConfig({ apiKey });
        console.log(chalk.cyan('Current Configuration:'));
        console.log(`  API Key: ${apiKey.substring(0, 8)}...`);
        console.log(`  Endpoint: ${config.getEndpoint()}`);
        console.log(`  Timeout: ${config.getTimeout()}ms`);
        console.log(`  Cache Enabled: ${config.isCacheEnabled()}`);
        console.log(`  Cache TTL: ${config.getCacheTTL()}s`);
        console.log(`  Source: OpenCode auth.json`);
      } else {
        console.log(chalk.yellow('No API key found in OpenCode auth.json'));
        console.log(chalk.cyan('  Set ZAI_API_KEY environment variable or use --api-key option'));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
      process.exit(1);
    }
  });

program
  .command('clear-cache')
  .description('Clear quota cache')
  .action(() => {
    try {
      const agent = new ZaiQuotaAgent();
      agent.clearCache();
      console.log(chalk.green('✅ Cache cleared'));
    } catch (error) {
      if (error instanceof Error) {
        console.error(chalk.red(`Error: ${error.message}`));
      }
      process.exit(1);
    }
  });

// Parse arguments
if (process.argv.length === 2) {
  // No command provided, show help
  program.help();
} else {
  program.parse();
}
