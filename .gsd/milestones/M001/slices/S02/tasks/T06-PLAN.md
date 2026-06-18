# T06 Plan — Refactor bin/skill-loader.js

## Objective
Refactor `bin/skill-loader.js` to use ToolRegistry instead of hardcoded tool lists.

## Files to Modify
- `bin/skill-loader.js`

## Current State (to Replace)
- Hardcoded array of skill categories and tool names
- No filtering by availability
- Direct `require` of skill files

## Target State
- Import ToolRegistry from `lib/tool-registry.js`
- Register all skills with their isUsable checks
- Use `ToolRegistry.findUsable(category)` for agent queries
- Export registry for external use

## Implementation Steps

1. **Add import**:
   ```javascript
   const { ToolRegistry } = require('../lib/tool-registry.js');
   ```

2. **Create registry instance**:
   ```javascript
   const toolRegistry = new ToolRegistry();
   ```

3. **Register each skill** with isUsable:
   ```javascript
   // Deploy tools
   toolRegistry.register('git-free-deploy', {
     category: 'deploy',
     isUsable: () => checkCommand('git --version'),
     metadata: { description: 'Deploy via git push' }
   });
   
   toolRegistry.register('one-click-netlify', {
     category: 'deploy',
     isUsable: () => checkCommand('netlify --version'),
     metadata: { description: 'Deploy to Netlify' }
   });
   
   toolRegistry.register('one-click-vercel', {
     category: 'deploy',
     isUsable: () => checkCommand('vercel --version'),
     metadata: { description: 'Deploy to Vercel' }
   });
   ```

4. **Helper function** for command checks:
   ```javascript
   function checkCommand(cmd) {
     try {
       require('child_process').execSync(cmd, { stdio: 'ignore' });
       return true;
     } catch {
       return false;
     }
   }
   ```

5. **Export registry**:
   ```javascript
   module.exports = { toolRegistry, loadSkills };
   ```

## Verification
- `bin/skill-loader.js` imports ToolRegistry
- No hardcoded tool arrays remain
- All skills registered with isUsable
- Exports toolRegistry for agent queries
- `npm test` passes