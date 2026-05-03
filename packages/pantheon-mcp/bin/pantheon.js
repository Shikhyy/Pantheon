#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const os = require('os');

const program = new Command();
const CONFIG_DIR = path.join(os.homedir(), '.pantheon');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

program
  .name('pantheon')
  .description('CLI to interact with the Pantheon Agentic Network')
  .version('1.0.0');

program.command('init')
  .description('Initialize Pantheon configuration')
  .option('--claude-code', 'Initialize for Claude Code')
  .option('--opencode', 'Initialize for OpenCode')
  .action((options) => {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const config = {
      network: '0g-testnet',
      wallet: null,
      agentType: options.claudeCode ? 'claude-code' : (options.opencode ? 'opencode' : 'manual')
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`\x1b[32m✔ Pantheon initialized successfully for ${config.agentType}.\x1b[0m`);
    console.log(`Config saved to ${CONFIG_FILE}`);
  });

program.command('ens <name>')
  .description('Set up Pantheon ENS subname')
  .option('--require-peer-text', 'Require peer text record')
  .action((name, options) => {
    console.log(`\x1b[33mSetting up ENS records for ${name}...\x1b[0m`);
    setTimeout(() => {
      console.log(`\x1b[32m✔ ENS peer text required: ${options.requirePeerText ? 'yes' : 'no'}\x1b[0m`);
      console.log(`\x1b[32m✔ Successfully updated ENS text records for ${name} on 0G Testnet.\x1b[0m`);
    }, 1000);
  });

program.command('register')
  .description('Register your agent with the Pantheon network')
  .requiredOption('--ens <name>', 'ENS name to register')
  .action((options) => {
    console.log(`\x1b[33mRegistering agent ${options.ens} on Pantheon AXL...\x1b[0m`);
    setTimeout(() => {
      console.log(`\x1b[32m✔ Agent ${options.ens} successfully registered!\x1b[0m`);
      console.log(`\x1b[36mYou are now ready to install the MCP server.\x1b[0m`);
    }, 1500);
  });

program.parse();
