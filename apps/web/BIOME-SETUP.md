# Biome Editor Integration Guide

This project uses Biome for linting and formatting. Follow these instructions to set up your editor for the best development experience.

## VS Code Setup

1. **Install the Biome Extension**
   - Open VS Code
   - Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
   - Search for "Biome" 
   - Install the official Biome extension by biomejs

2. **Configure VS Code Settings**
   Add to your `.vscode/settings.json`:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "biomejs.biome",
     "[javascript]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[typescript]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[javascriptreact]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "[typescriptreact]": {
       "editor.defaultFormatter": "biomejs.biome"
     },
     "editor.codeActionsOnSave": {
       "quickfix.biome": "explicit",
       "source.organizeImports.biome": "explicit"
     }
   }
   ```

## IntelliJ IDEA / WebStorm Setup

1. **Install the Biome Plugin**
   - Go to Settings → Plugins
   - Search for "Biome"
   - Install the Biome plugin

2. **Configure Biome**
   - Go to Settings → Tools → Biome
   - Enable "Run Biome on save"
   - Set the Biome binary path (usually `node_modules/.bin/biome`)

## Neovim Setup

1. **Using Mason and null-ls**
   ```lua
   -- Install biome via Mason
   require("mason").setup()
   require("mason-lspconfig").setup({
     ensure_installed = { "biome" }
   })

   -- Configure null-ls
   local null_ls = require("null-ls")
   null_ls.setup({
     sources = {
       null_ls.builtins.formatting.biome,
       null_ls.builtins.diagnostics.biome,
     },
   })
   ```

## Command Line Usage

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm format

# Format specific files
npx biome format --write src/components/MyComponent.tsx

# Check specific files
npx biome check src/services/

# Organize imports
npx biome check --apply-unsafe --formatter-enabled=false --linter-enabled=false --organize-imports-enabled=true .
```

## Pre-commit Hook (Optional)

To ensure code quality before commits, add a pre-commit hook:

1. Install husky:
   ```bash
   pnpm add -D husky
   npx husky install
   ```

2. Add pre-commit hook:
   ```bash
   npx husky add .husky/pre-commit "pnpm lint:check"
   ```

## Troubleshooting

### Biome not formatting on save
- Ensure the Biome extension is installed and enabled
- Check that `editor.formatOnSave` is set to `true`
- Verify the file type is supported (JS, TS, JSX, TSX)

### Conflicts with other formatters
- Disable Prettier or ESLint extensions for this workspace
- Set Biome as the default formatter in VS Code settings

### Performance issues
- Biome is very fast (10-50x faster than ESLint)
- If you experience issues, check for conflicting extensions
- Try restarting your editor

## Migration from ESLint/Prettier

This project has migrated from ESLint/Prettier to Biome. Benefits include:
- **Speed**: 10-50x faster linting and formatting
- **Simplicity**: Single tool for both linting and formatting
- **Consistency**: Unified configuration in `biome.json`
- **Better DX**: Faster feedback loops, better error messages

## Resources

- [Biome Documentation](https://biomejs.dev/)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Configuration Reference](https://biomejs.dev/reference/configuration/)
- [Rules Reference](https://biomejs.dev/linter/rules/)