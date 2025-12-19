# 🚀 Beggy MCP Tools - Complete Guide

**Model Context Protocol tools to supercharge your Beggy development!**

This MCP server lets you use Claude Desktop to automate boring tasks like:

- ✅ Converting JavaScript to TypeScript
- ✅ Generating React components
- ✅ Creating shared types
- ✅ Testing API endpoints

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Setup Guide](#setup-guide)
3. [Available Tools](#available-tools)
4. [Usage Examples](#usage-examples)
5. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

- Claude Desktop app installed
- Node.js 18+ and pnpm
- Anthropic API key (for TypeScript conversion)

### Installation

```bash
# 1. Navigate to MCP directory
cd apps/mcp

# 2. Install dependencies
pnpm install

# 3. Build the MCP server
pnpm build

# 4. Create .env file
cp .env.example .env

# 5. Add your Anthropic API key to .env
echo "ANTHROPIC_API_KEY=your_key_here" >> .env
```

---

## ⚙️ Setup Guide

### Step 1: Get Your Anthropic API Key

1. Go to `https://console.anthropic.com/`
2. Sign up or log in
3. Go to "API Keys"
4. Create a new key
5. Copy it to `apps/mcp/.env`:

```env
# apps/mcp/.env
ANTHROPIC_API_KEY=sk-ant-xxxxx
API_URL=http://localhost:3000
```

### Step 2: Configure Claude Desktop

**Find your config file:**

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Add this configuration** (replace `/absolute/path/to` with your actual path):

```json
{
	"mcpServers": {
		"beggy": {
			"command": "node",
			"args": ["/absolute/path/to/beggy/apps/mcp/dist/index.js"],
			"env": {
				"ANTHROPIC_API_KEY": "your_api_key_here",
				"API_URL": "http://localhost:3000"
			}
		}
	}
}
```

💡 **Tip**: Get absolute path with: `cd apps/mcp && pwd`

### Step 3: Restart Claude Desktop

1. Completely quit Claude Desktop
2. Reopen it
3. Look for **🔌 Beggy** in the bottom-left corner
4. If you see it, you're ready! 🎉

---

## 🛠️ Available Tools

### 1. `convert_to_typescript`

**Convert JavaScript files to TypeScript with AI-powered type inference.**

**What it does:**

- Reads your .js file
- Adds TypeScript type annotations
- Converts require() to imports
- Creates a backup of the original
- Writes the new .ts file

**Usage:**

```text
You: Convert apps/api/src/controllers/userController.js to TypeScript
You: Make tripController.js into TypeScript
You: Convert my auth middleware to TS
```

---

### 2. `generate_shared_types`

**Analyze your backend and generate TypeScript types for packages/shared.**

**What it does:**

- Scans your backend code
- Identifies data structures
- Generates interfaces for Trip, User, Packing, etc.
- Writes to packages/shared/src/types/

**Usage:**

```text
You: Generate shared types from my API
You: Create TypeScript types for my models
```

---

### 3. `scaffold_react_component`

**Generate React components with TypeScript and SCSS/Tailwind.**

**What it does:**

- Creates .tsx file
- Generates TypeScript props interface
- Adds SCSS module or Tailwind classes
- Includes helpful comments

**Usage:**

```text
You: Create a TripCard component for the trips feature
You: Scaffold a PackingListPage with SCSS styling
You: Make a WeatherWidget component using both Tailwind and SCSS
```

**Options:**

- `type`: "component" or "page"
- `styling`: "tailwind", "scss", or "both"

---

### 4. `test_api_endpoint`

**Test your API endpoints quickly without Postman.**

**What it does:**

- Calls your backend API
- Shows the response
- Handles errors

**Usage:**

```text
You: Test GET /trips endpoint
You: Test POST /auth/login with email test@example.com and password 123456
You: Call my user registration endpoint
```

---

### 5. `analyze_backend_structure`

**Understand your existing code structure.**

**What it does:**

- Scans your backend files
- Categorizes controllers, routes, models, etc.
- Shows what you have
- Suggests conversion order

**Usage:**

```text
You: Analyze my backend code
You: What controllers do I have?
You: Show me my API structure
```

---

## 💡 Usage Examples

### Example 1: Converting Backend to TypeScript

**Step-by-step workflow:**

```text
1️⃣ Analyze your code first:
You: Analyze my backend structure

Claude: [Shows you all your files organized by type]

2️⃣ Start with models (no dependencies):
You: Convert apps/api/src/models/User.js to TypeScript

Claude: [Converts it, shows you the code, backs up original]

3️⃣ Continue with services:
You: Convert apps/api/src/services/authService.js to TypeScript

4️⃣ Then controllers:
You: Convert apps/api/src/controllers/auth-controller.js to TypeScript

5️⃣ Finally routes:
You: Convert apps/api/src/routes/authRoutes.js to TypeScript

6️⃣ Generate shared types:
You: Generate shared types from my API

Claude: [Creates types in packages/shared/]
```

---

### Example 2: Building Frontend Features

**Creating the trips feature:**

```text
1️⃣ Create the page:
You: Scaffold a TripsListPage in the trips feature with both Tailwind and SCSS

2️⃣ Create components:
You: Create a TripCard component for trips with SCSS styling

3️⃣ Create more components:
You: Make a CreateTripForm component using Tailwind

4️⃣ Add a weather widget:
You: Scaffold a WeatherWidget component with both styling options
```

---

### Example 3: Testing Your API

**Quick API testing:**

```text
1️⃣ Test a GET endpoint:
You: Test GET /trips

Claude: [Shows response with all trips]

2️⃣ Test POST with data:
You: Test POST /trips with destination "Paris", startDate "2024-06-01", endDate "2024-06-10"

Claude: [Creates trip, shows response]

3️⃣ Test authentication:
You: Test POST /auth/login with email "test@example.com" and password "password123"

Claude: [Shows auth response with token]
```

---

## 🎨 SCSS vs Tailwind - When to Use What?

### Use **Tailwind** for

✅ Quick prototyping
✅ Consistent spacing/colors
✅ Simple layouts
✅ Responsive design

### Use **SCSS** for

✅ Complex animations
✅ Component-specific styles
✅ Deeply nested elements
✅ Custom design systems

### Use **Both** (Recommended!)

```tsx
// Tailwind for layout and spacing
<div className="flex items-center gap-4 p-6">
	{/* SCSS for custom component styles */}
	<div className={styles.customCard}>
		{/* Tailwind for simple utilities */}
		<h3 className="text-lg font-bold">Title</h3>
	</div>
</div>
```

---

## 🐛 Troubleshooting

### MCP not showing in Claude Desktop

**Problem**: Can't see "🔌 Beggy" in Claude Desktop

**Solutions**:

1. Check config file path is correct
2. Ensure `command` path is absolute (not relative)
3. Make sure you built the MCP: `cd apps/mcp && pnpm build`
4. Restart Claude Desktop **completely** (quit, don't just close window)
5. Check Claude Desktop logs: Help → View Logs

---

### TypeScript conversion fails

**Problem**: "ANTHROPIC_API_KEY not found"

**Solution**: Add your API key to `apps/mcp/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

---

### Component generation fails

**Problem**: "Directory not found"

**Solution**: Make sure you're in the project root when talking to Claude. The MCP looks for `apps/web/src/features/`.

---

### API testing fails

**Problem**: "Connection refused"

**Solutions**:

1. Make sure your API is running: `cd apps/api && pnpm dev`
2. Check the API_URL in Claude Desktop config matches your API port
3. Default is `http://localhost:3000`

---

## 📚 Common Workflows

### Daily Development Workflow

**Morning:**

```text
You: Analyze my backend to see what needs converting
Claude: [Shows analysis]

You: Convert [highest priority file] to TypeScript
Claude: [Converts it]

You: Generate shared types
Claude: [Updates packages/shared]
```

**During feature development:**

```text
You: Create a [ComponentName] component for [feature]
Claude: [Scaffolds component]

You: Test POST /[endpoint] with [data]
Claude: [Tests API]
```

---

## 🎯 Best Practices

### 1. Convert Backend Gradually

Don't try to convert everything at once. Go file by file:

- Models → Utils → Services → Middleware → Controllers → Routes

### 2. Review AI-Generated Code

Always review the TypeScript conversion. The AI is smart but not perfect.

### 3. Use Type-Check Often

After converting files:

```bash

cd apps/api
pnpm type-check
```

### 4. Commit After Each Conversion

```bash

git add .
git commit -m "refactor: convert userController to TypeScript"
```

---

## 💬 Natural Language Tips

**Good prompts:**

- ✅ "Convert my user controller to TypeScript"
- ✅ "Create a TripCard component with SCSS"
- ✅ "Test my trips endpoint"

**Less effective:**

- ❌ "Use the convert tool" (too technical)
- ❌ "Run convert_to_typescript with..." (Claude knows what to do!)

**Just talk naturally!** Claude understands intent.

---

## 🆘 Getting Help

If you're stuck:

1. Check the troubleshooting section above
2. Look at Claude Desktop logs (Help → View Logs)
3. Make sure everything is built: `cd apps/mcp && pnpm build`
4. Try restarting Claude Desktop

---

## 🎉 You're Ready!

Start developing Beggy faster with your new AI-powered tools!

**First steps:**

1. Open Claude Desktop
2. Say: "Analyze my Beggy backend structure"
3. Follow the suggestions to start converting!

Happy coding! 🚀
