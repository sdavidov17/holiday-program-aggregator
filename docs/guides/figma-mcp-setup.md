# Figma MCP Setup Guide

## Overview
The Figma MCP (Model Context Protocol) server allows Claude Code to interact with your Figma designs directly, enabling:
- Reading design specs and components
- Extracting design tokens
- Understanding layout structures
- Accessing design system documentation

## Prerequisites

### 1. Figma Desktop App
- Download and install [Figma Desktop](https://www.figma.com/downloads/)
- Sign in with your Figma account
- Enable Dev Mode (requires Professional plan or higher)

### 2. Enable Dev Mode in Figma
1. Open Figma Desktop
2. Go to Preferences → Advanced
3. Enable "Developer Mode"
4. Restart Figma

### 3. Start Figma MCP Server
1. In Figma Desktop, open any file
2. Go to Plugins → Development → Start Local Server
3. The server will run on `http://127.0.0.1:3845/sse`

## Configuration

### Local Configuration (Already Set Up)
The `.mcp.json` file in this project includes Figma configuration:

```json
{
  "mcpServers": {
    "figma": {
      "transport": "sse",
      "url": "http://127.0.0.1:3845/sse",
      "description": "Figma Desktop Dev Mode MCP Server"
    }
  }
}
```

### Testing the Connection

1. Ensure Figma Desktop is running with Dev Mode enabled
2. In Claude Code terminal, run: `/mcp`
3. You should see "figma" listed as an available server
4. If not, run `/doctor` to diagnose issues

## Usage Examples

Once connected, you can ask Claude to:

### Design Queries
- "What are the primary colors in our design system?"
- "Show me the component structure for the navigation bar"
- "What spacing tokens are defined in Figma?"
- "Extract all text styles from the design"

### Design-to-Code
- "Generate React components based on the Figma components"
- "Create CSS variables from Figma design tokens"
- "Build the header component matching the Figma design"

## Other Useful MCP Servers

### Already Configured in `.mcp.json`:

1. **filesystem** - Enhanced file operations
   ```bash
   # Auto-installs via npx when used
   ```

2. **github** - GitHub API integration
   ```bash
   # Set your GitHub token:
   export GITHUB_TOKEN="your_token_here"
   ```

3. **postgres** - Database operations
   ```bash
   # Uses existing DATABASE_URL env variable
   ```

4. **git** - Git operations beyond basic commands

5. **web-search** - Web search capabilities

## Troubleshooting

### Figma Server Not Connecting
1. Check Figma Desktop is running
2. Verify Dev Mode is enabled
3. Check port 3845 is not blocked
4. Restart Figma Desktop

### MCP Servers Not Loading
1. Run `/doctor` in Claude Code
2. Check `.mcp.json` syntax
3. Verify npm/npx is available
4. Check environment variables

### Permission Issues
- Ensure Claude Code has network access
- Check firewall settings for localhost connections
- Verify Figma has necessary permissions

## Best Practices

1. **Start Figma First**: Always start Figma Desktop before using Claude Code
2. **Keep Files Open**: Have your design files open in Figma for best results
3. **Use Specific Queries**: Be specific about which components or frames you want to analyze
4. **Version Control**: Don't commit `.mcp.json` if it contains secrets (use env variables instead)

## Security Notes

- The Figma MCP server only runs locally (127.0.0.1)
- No design data leaves your machine
- Authentication is handled by Figma Desktop
- Use environment variables for sensitive tokens

## Additional Resources

- [MCP Documentation](https://docs.anthropic.com/en/docs/claude-code/mcp)
- [Figma Dev Mode](https://www.figma.com/developers/dev-mode)
- [MCP Server Examples](https://github.com/modelcontextprotocol/servers)

## Quick Start Checklist

- [ ] Install Figma Desktop
- [ ] Enable Dev Mode in Figma
- [ ] Start Figma and open a design file
- [ ] Verify `.mcp.json` exists in project root
- [ ] Run `/mcp` in Claude Code to verify connection
- [ ] Test with a simple query about your design