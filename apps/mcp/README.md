# Beggy MCP Tools

MCP (Model Context Protocol) tools to help develop Beggy faster.

## 🚀 Setup

### 1. Build the MCP server

```bash
cd apps/mcp
pnpm install
pnpm build
```

### 2. Configure Claude Desktop

Add this to your Claude Desktop config file:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
	"mcpServers": {
		"beggy": {
			"command": "node",
			"args": ["/absolute/path/to/beggy/apps/mcp/dist/index.js"],
			"env": {
				"API_URL": "http://localhost:3000"
			}
		}
	}
}
```

**Important:** Replace `/absolute/path/to/beggy` with your actual path!

### 3. Restart Claude Desktop

Close and reopen Claude Desktop. You should see "🔌 Beggy" in the MCP menu.

## 📚 Available Tools

### 1. `convert_to_typescript`

Convert JavaScript files to TypeScript.

**Example:**

```text
You: Convert apps/api/src/controllers/tripController.js to TypeScript
```

### 2. `generate_shared_types`

Analyze backend code and generate shared types.

**Example:**

```text
You: Generate shared types from apps/api/src/controllers
```

### 3. `scaffold_react_component`

Generate React components with proper structure.

**Example:**

```text
You: Scaffold a TripCard component in the trips feature
You: Create a PackingListPage in the packing feature
```

### 4. `test_api_endpoint`

Test API endpoints quickly.

**Example:**

```text
You: Test GET /trips
You: Test POST /trips with body {"destination": "Paris", "startDate": "2024-06-01", "endDate": "2024-06-10"}
```

## 💡 Usage Tips

### Quick API Testing

```text
You: Test my trips API endpoint
MCP: [Calls GET /trips, shows response]

You: Create a test trip to London
MCP: [Calls POST /trips, shows created trip]
```

### Rapid Component Generation

```text
You: I need a WeatherWidget component for trips
MCP: [Creates apps/web/src/features/trips/components/WeatherWidget.tsx]

You: Show me what you created
MCP: [Shows the generated code]

You: Add a prop for temperature unit
MCP: [Updates the component]
```

### Type Generation Workflow

```text
You: I just updated my Trip model in Prisma. Generate the shared types.
MCP: [Analyzes Prisma schema, creates TypeScript types in packages/shared]

You: Perfect! Now create a React hook to fetch trips.
```

## 🔧 Development

### Run in watch mode

```bash
pnpm dev
```

### Add new tools

1. Create a new file in `src/tools/`
2. Export a function that returns MCP response format
3. Register the tool in `src/index.ts`

## 🎯 Common Workflows

### Converting Backend to TypeScript

```text
You: Convert all my controllers to TypeScript, starting with authController.js
MCP: [Converts authController.js → authController.ts]

You: Great! Now do tripController.js
MCP: [Converts tripController.js → tripController.ts]
```

### Building Frontend Features

```text
You: I need to build the trips feature. Start with the trips list page.
MCP: [Scaffolds TripsListPage.tsx]

You: Now create a TripCard component to display each trip.
MCP: [Scaffolds TripCard.tsx]

You: Generate the Redux slice for trips state.
```

## ⚙️ Environment Variables

Create `.env` in `apps/mcp/`:

```env
API_URL=http://localhost:3000
AUTH_TOKEN=your_test_token_here  # Optional: for authenticated requests
```

## 🐛 Troubleshooting

### MCP not showing in Claude Desktop

1. Check the config file path is correct
2. Ensure the `command` path is absolute
3. Restart Claude Desktop completely

### Tools failing

1. Make sure your API is running (`pnpm dev` in apps/api)
2. Check the API_URL in config
3. Look at Claude Desktop logs: Help → View Logs
