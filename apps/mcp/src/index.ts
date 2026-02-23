#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { z } from 'zod';
import {
	createModule,
	CreateModuleInputSchema,
} from './tools/create-module.tool.js';

dotenv.config();

const server = new McpServer(
	{ name: 'beggy-mcp', version: '1.1.0' },
	{ capabilities: { tools: {} } }
);

server.registerTool(
	'create-module',
	{
		description:
			'Scaffolds a complete Beggy API module with full CRUD. ' +
			'No AI — pure deterministic templates, instant and reliable. ' +
			'Generates: service (getAll, getById, create, update, deleteById, deleteMany), ' +
			'controller, route (GET/, GET/:id, POST/, PATCH/:id, DELETE/:id, DELETE/), ' +
			'mapper (toDTO), index. ' +
			'Smart checklist — only shows setup steps not already done in your project. ' +
			'Pass the plural folder name: "trips", "bags", "bag-items".',
		inputSchema: CreateModuleInputSchema,
	},
	async (args) => {
		try {
			const result = await createModule(args);
			return { content: [{ type: 'text', text: result }] };
		} catch (error) {
			const message =
				error instanceof z.ZodError
					? `Input error:\n${error.issues.map((e) => `  ${e.path.join('.')}: ${e.message}`).join('\n')}`
					: error instanceof Error
						? error.message
						: 'Unknown error';
			return {
				content: [{ type: 'text', text: message }],
				isError: true,
			};
		}
	}
);

const transport = new StdioServerTransport();
await server.connect(transport);
