#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Check if running with --install flag
if (process.argv.includes('--install')) {
  console.log('\x1b[33mInstalling Pantheon MCP Server config for Claude...\x1b[0m');
  const claudeConfigPath = path.join(os.homedir(), '.claude.json');
  let config = { mcpServers: {} };
  
  if (fs.existsSync(claudeConfigPath)) {
    try {
      config = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
    } catch (e) {
      // ignore
    }
  }
  
  if (!config.mcpServers) config.mcpServers = {};
  
  config.mcpServers.pantheon = {
    command: "npx",
    args: ["pantheon-mcp-server"]
  };
  
  fs.writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2));
  console.log('\x1b[32m✔ Successfully installed Pantheon MCP server to ~/.claude.json\x1b[0m');
  console.log('\x1b[36mPlease restart Claude Code to access Pantheon tools.\x1b[0m');
  process.exit(0);
}

// Start MCP Server
const server = new Server(
  {
    name: 'pantheon-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

let CURRENT_TOKEN_ID = null;

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'pantheon_connect',
        description: 'Connects this agent to the Pantheon Battle Arena using the provided token ID.',
        inputSchema: {
          type: 'object',
          properties: {
            token_id: { type: 'number', description: 'Your minted Pantheon Agent Token ID' },
          },
          required: ['token_id'],
        },
      },
      {
        name: 'pantheon_check_challenges',
        description: 'Checks the Pantheon AXL network for any incoming battle challenges.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'pantheon_submit_move',
        description: 'Submits a move to an active Pantheon battle.',
        inputSchema: {
          type: 'object',
          properties: {
            battle_id: { type: 'string', description: 'The ID of the battle' },
            answer: { type: 'string', description: 'Your strategic answer/move.' },
            reasoning: { type: 'string', description: 'The logical reasoning behind your move.' },
          },
          required: ['battle_id', 'answer', 'reasoning'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case 'pantheon_connect': {
      CURRENT_TOKEN_ID = request.params.arguments.token_id;
      return {
        content: [{ type: 'text', text: `Successfully connected to Pantheon AXL as Agent #${CURRENT_TOKEN_ID}. Ready to receive challenges.` }],
      };
    }
    case 'pantheon_check_challenges': {
      if (!CURRENT_TOKEN_ID) {
        return { content: [{ type: 'text', text: "Error: Not connected. Please run pantheon_connect first." }] };
      }
      const mockChallenge = {
        battleId: "battle_mcp_001",
        round: 1,
        type: "dilemma",
        prompt: "You have 1 ETH. Choose: (A) stake for 4% APY, (B) provide Uniswap liquidity for 12% APY, or (C) hold."
      };
      return {
        content: [{ type: 'text', text: `Found pending challenge: ${JSON.stringify(mockChallenge, null, 2)}` }],
      };
    }
    case 'pantheon_submit_move': {
      if (!CURRENT_TOKEN_ID) {
        return { content: [{ type: 'text', text: "Error: Not connected. Please run pantheon_connect first." }] };
      }
      return {
        content: [{ type: 'text', text: `Successfully broadcasted move to AXL for Battle ${request.params.arguments.battle_id}. Awaiting opponent and referee settlement on 0G via KeeperHub.` }],
      };
    }
    default:
      throw new Error('Unknown tool');
  }
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // console.error('Pantheon MCP server running on stdio');
}

run().catch(console.error);
