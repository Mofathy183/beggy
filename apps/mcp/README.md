<div align="center">

# `@beggy/mcp`

**The Beggy Model Context Protocol server — AI-assisted development tooling for the monorepo.**

[![MCP SDK](https://img.shields.io/badge/MCP_SDK-1.24-6366F1?style=flat-square)](https://github.com/modelcontextprotocol/typescript-sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

---

## Overview

`@beggy/mcp` is a **Model Context Protocol (MCP) server** that exposes development tooling for the Beggy monorepo to AI assistants. It automates repetitive engineering tasks such as TypeScript conversion, component scaffolding, API testing, and code generation.

The MCP server runs as a subprocess or CLI tool and communicates with AI assistants via the MCP protocol, allowing them to act as first-class contributors to the codebase.

---

## What is MCP?

The **Model Context Protocol** is a standard for letting AI assistants communicate with external tooling. An MCP server exposes **tools** that an AI can invoke, similar to function calling but with a standardized protocol layer.

```text
AI Assistant (Claude, Cursor, etc.)
        ↕  MCP protocol
@beggy/mcp server
        ↕
Beggy monorepo (file system, APIs, code gen)
```

---

## Capabilities

| Tool | Description |

|---|---|
| TypeScript conversion | Convert JavaScript files to TypeScript automatically |
| Component scaffolding | Generate new feature modules following Beggy conventions |
| API testing | Run and inspect API endpoint tests programmatically |
| Code generation | Scaffold boilerplate for new domains (service, controller, route, schema, types) |

---

## Tech Stack

| Category | Technology |

|---|---|
| **Runtime** | Node.js ≥ 18, ESM |
| **Protocol** | `@modelcontextprotocol/sdk` 1.24.3 |
| **Compilation** | SWC (`@swc/cli`, `@swc/core`) |
| **Dev mode** | `tsx` (watch mode) |
| **HTTP** | `axios` 1.7 |
| **Validation** | `zod` 4.1 |
| **Shared** | `@beggy/shared` (workspace) |

---

## Project Structure

```text
apps/mcp/
│
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── tools/             # Tool implementations
│   │   ├── convert/       # JS → TS conversion tool
│   │   ├── scaffold/      # Component/module scaffolding tool
│   │   ├── test/          # API testing tool
│   │   └── generate/      # Code generation tool
│   └── utils/             # Shared utilities
│
└── dist/                  # Compiled output
```

---

## Running Locally

### Development (watch mode)

```bash
cd apps/mcp
pnpm dev
```

### Production

```bash
pnpm build
pnpm start
```

### CLI (after build)

The package exposes a `beggy-mcp` binary:

```bash
beggy-mcp
```

---

## Connecting to an AI Assistant

Configure your AI assistant to use this MCP server by pointing it at the compiled binary or using the `dev` script for local development.

**Example (Claude Desktop `config.json`):**

```json
{
	"mcpServers": {
		"beggy": {
			"command": "node",
			"args": ["/path/to/beggy/apps/mcp/dist/src/index.js"]
		}
	}
}
```

---

## Scripts

```bash
pnpm dev            # Start in watch mode (tsx)
pnpm build          # Compile with SWC
pnpm start          # Run compiled output
pnpm test:convert   # Test the TypeScript conversion tool
pnpm lint           # ESLint
pnpm lint:fix       # ESLint with auto-fix
pnpm format         # Prettier
pnpm format:check   # Prettier check
pnpm type-check     # TypeScript type checking
```

---

## Environment Variables

```env
# Optional — used if the MCP tools make requests to the Beggy API
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Create `apps/mcp/.env` as needed.

---

<div align="center">
<sub>Part of the <a href="../../README.md">Beggy monorepo</a> · MIT License</sub>
</div>
