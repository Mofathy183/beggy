#!/usr/bin/env node
//* make sure that you import everything in the {.js} to make it work as it suppose be
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ErrorCode,
	McpError,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { convertApiToTypeScript } from './tools/convert-to-typeScript.js';
import { renameFiles } from './tools/rename-files.js'; // Fixed import

// Load environment variables
dotenv.config();

const server = new Server(
	{
		name: 'beggy-mcp',
		version: '1.0.0',
	},
	{
		capabilities: {
			tools: {},
		},
	}
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: 'convert_api_to_typescript',
				description:
					'Convert Express.js Prisma PostgreSQL API files from JavaScript to TypeScript. Handles Express Request/Response types, Prisma types, and common API patterns. Can convert a single file or an entire directory.',
				inputSchema: {
					type: 'object',
					properties: {
						filePath: {
							type: 'string',
							description:
								'Path to the JavaScript file or directory to convert. Can be relative to workspace root or absolute path. Example: "apps/api/src/controllers/auth-controller.js" or "apps/api/src/controllers"',
						},
						backup: {
							type: 'boolean',
							description:
								'Whether to create a backup of the original .js file before conversion. Default: true',
							default: true,
						},
						overwrite: {
							type: 'boolean',
							description:
								'Whether to overwrite existing .ts files. Default: false',
							default: false,
						},
					},
					required: ['filePath'],
				},
			},
			{
				name: 'rename_files',
				description:
					'Rename JS/TS files to the dot convention based on their folder type (e.g. userController.ts in controllers → user.controller.ts, userConfig.ts in config → user.config.ts) and optionally update imports.',
				inputSchema: {
					type: 'object',
					properties: {
						directory: {
							type: 'string',
							description:
								'Directory to scan (e.g. "apps/api/src/controllers")',
						},
						dryRun: {
							type: 'boolean',
							default: true,
							description:
								'If true, shows changes without renaming files',
						},
						updateImports: {
							type: 'boolean',
							default: true,
							description:
								'Automatically update import/require statements',
						},
					},
					required: ['directory'],
				},
			},
		],
	};
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	try {
		switch (name) {
			case 'convert_api_to_typescript': {
				if (
					!args ||
					typeof args !== 'object' ||
					!('filePath' in args)
				) {
					throw new McpError(
						ErrorCode.InvalidParams,
						'filePath is required'
					);
				}

				const filePath = args.filePath as string;
				const backup = args.backup !== undefined ? args.backup : true;
				const overwrite =
					args.overwrite !== undefined ? args.overwrite : false;

				const result = await convertApiToTypeScript({
					filePath,
					backup: backup as boolean,
					overwrite: overwrite as boolean,
				});

				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(result, null, 2),
						},
					],
				};
			}

			case 'rename_files': {
				if (
					!args ||
					typeof args !== 'object' ||
					!('directory' in args)
				) {
					throw new McpError(
						ErrorCode.InvalidParams,
						'directory is required'
					);
				}

				const directory = args.directory as string;
				const dryRun =
					args.dryRun !== undefined ? (args.dryRun as boolean) : true;
				const updateImports =
					args.updateImports !== undefined
						? (args.updateImports as boolean)
						: true;

				// Call the renameFiles function
				const result = await renameFiles({
					directory,
					dryRun,
					updateImports,
				});

				return {
					content: [
						{
							type: 'text',
							text: result, // This should be a string already
						},
					],
				};
			}

			default:
				throw new McpError(
					ErrorCode.MethodNotFound,
					`Unknown tool: ${name}`
				);
		}
	} catch (error) {
		if (error instanceof McpError) {
			throw error;
		}

		const errorMessage =
			error instanceof Error ? error.message : String(error);
		throw new McpError(
			ErrorCode.InternalError,
			`Tool execution failed: ${errorMessage}`
		);
	}
});

// Start the server
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error('Beggy MCP server running on stdio');
}

main().catch((error) => {
	console.error('Fatal error in main():', error);
	process.exit(1);
});
