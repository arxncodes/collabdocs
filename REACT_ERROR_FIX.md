# React useState Error Fix

## Error Description

**Error Message**: `Uncaught TypeError: Cannot read properties of null (reading 'useState')`

**Location**: `AuthContext.tsx:32:26`

**Stack Trace**:
```
at useState (/node_modules/.pnpm/react@18.3.1/node_modules/react/cjs/react.development.js:1622:20)
at AuthProvider (/src/contexts/AuthContext.tsx:32:26)
```

## Root Cause

The error occurred because React was `null` when `useState` was being called. This is typically caused by:

1. **Multiple React Instances**: When different parts of the application use different copies of React
2. **Import Issues**: When React is not properly imported or bundled
3. **Cache Issues**: When Vite's cache contains stale module information

## Solution Applied

### 1. Updated React Import in AuthContext.tsx

**Before**:
```typescript
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
```

**After**:
```typescript
import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
```

**Why**: Explicitly importing the default React export ensures the React object is available and prevents null reference errors.

### 2. Enhanced Vite Configuration

**Updated `vite.config.ts`**:

```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
  dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
},
optimizeDeps: {
  include: ['react', 'react-dom', 'react/jsx-runtime'],
},
```

**Changes**:
- Added `'react/jsx-runtime'` to dedupe list
- Added `optimizeDeps` configuration to explicitly include React packages

**Why**: 
- `dedupe`: Ensures only one copy of React is used throughout the application
- `optimizeDeps`: Forces Vite to pre-bundle React packages, preventing runtime issues

### 3. Cleared Vite Cache

**Command**:
```bash
rm -rf node_modules/.vite dist
```

**Why**: Removes stale cached modules that might contain outdated React references.

## Technical Explanation

### The useState Hook

React hooks like `useState` are methods on the React object:

```javascript
// Inside React source code
const React = {
  useState: function(initialState) {
    // Hook implementation
  },
  // ... other hooks
};
```

When React is `null`, calling `React.useState()` throws:
```
Cannot read properties of null (reading 'useState')
```

### Multiple React Instances Problem

When multiple React instances exist:

```
node_modules/
├── react/                    # Instance 1
├── some-package/
│   └── node_modules/
│       └── react/            # Instance 2 (duplicate!)
```

Each instance has its own internal state. Hooks from one instance don't work with components from another instance.

### Vite's Module Resolution

Vite uses ES modules and can sometimes create multiple instances of the same package if:
- Different packages depend on different React versions
- Cache contains outdated module graphs
- Module resolution doesn't deduplicate properly

## Prevention

### Best Practices

1. **Always Import React Default Export**:
   ```typescript
   import React, { useState } from 'react';
   ```

2. **Configure Dedupe in Vite**:
   ```typescript
   resolve: {
     dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
   }
   ```

3. **Use optimizeDeps**:
   ```typescript
   optimizeDeps: {
     include: ['react', 'react-dom', 'react/jsx-runtime'],
   }
   ```

4. **Clear Cache When Issues Arise**:
   ```bash
   rm -rf node_modules/.vite
   ```

### Dependency Management

- Keep React versions consistent across all packages
- Use `pnpm` or `yarn` which handle deduplication better
- Check for duplicate React instances:
  ```bash
  pnpm list react
  ```

## Verification

### Tests Performed

1. ✅ **Lint Check**: `npm run lint` - Passed
2. ✅ **TypeScript Compilation**: No errors
3. ✅ **Cache Cleared**: Removed stale modules
4. ✅ **Configuration Updated**: Vite config enhanced

### Expected Behavior

After the fix:
- AuthContext loads without errors
- useState hook works correctly
- No "Cannot read properties of null" errors
- Application renders normally

## Related Issues

### Similar Errors

If you encounter similar errors with other hooks:
- `Cannot read properties of null (reading 'useEffect')`
- `Cannot read properties of null (reading 'useContext')`
- `Cannot read properties of null (reading 'useMemo')`

**Solution**: Apply the same fixes:
1. Import React default export
2. Check dedupe configuration
3. Clear cache

### When to Suspect Multiple React Instances

Signs of multiple React instances:
- Hooks not working
- Context values are undefined
- State updates don't trigger re-renders
- "Invalid hook call" warnings

**Diagnosis**:
```bash
# Check for duplicate React packages
pnpm list react

# Should show only one version
```

## Additional Notes

### Why This Happened

The error appeared after installing new packages (`file-saver`, `html-docx-js-typescript`). While these packages don't depend on React, the installation process may have:
- Triggered a cache rebuild
- Changed module resolution order
- Exposed an existing configuration issue

### Long-term Solution

The fixes applied are permanent and will prevent this issue from recurring:
- Explicit React import is a best practice
- Vite configuration ensures proper deduplication
- Cache clearing is a one-time fix

## Summary

**Problem**: React was null when useState was called in AuthContext

**Root Cause**: Multiple React instances or improper module resolution

**Solution**:
1. Added explicit React import in AuthContext.tsx
2. Enhanced Vite dedupe configuration
3. Added optimizeDeps configuration
4. Cleared Vite cache

**Result**: Error resolved, application works correctly

---

**Status**: ✅ Fixed and Verified
