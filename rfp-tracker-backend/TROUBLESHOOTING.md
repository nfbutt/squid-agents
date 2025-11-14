# Troubleshooting Guide

## Common Errors and Solutions

### Error: FUNCTION_NOT_FOUND

**Symptoms:**
- Test scripts fail with `FUNCTION_NOT_FOUND` error
- Functions not visible in Squid Console

**Cause:**
Backend functions haven't been deployed to Squid Cloud.

**Solution:**
```bash
cd rfp-tracker-backend
npm run deploy
```

Wait for deployment to complete, then verify functions in Squid Console:
1. Go to https://console.getsquid.ai/
2. Navigate to Backend → Functions
3. Verify all functions are listed

---

### Error: Internal Server Error (500)

**Symptoms:**
- Functions return 500 Internal Server Error
- "Unable to analyze similar projects" message

**Common Causes & Solutions:**

#### 1. AI Agent Not Created

**Error message:** `AI agent 'matching-agent' not found or not accessible`

**Solution:**
Create the AI agent in Squid Console:
1. Go to https://console.getsquid.ai/
2. Navigate to AI → Agents
3. Click "Create Agent"
4. Set Agent ID: `matching-agent`
5. Configure the agent with your preferred AI model
6. Save

#### 2. Knowledge Base Not Initialized

**Error message:** `Knowledge base not found`

**Solution:**
```typescript
// Initialize the knowledge base first
await squid.executeFunction('initializeKnowledgeBase');

// Then store projects
await squid.executeFunction('storeProjects', projects);
```

#### 3. No Projects in Knowledge Base

**Error message:** `No similar projects found in knowledge base`

**Solution:**
Ensure projects are stored before matching:
```typescript
// Store test projects
const { TEST_PROJECTS } = require('./service/matching-service.test');
await squid.executeFunction('storeProjects', TEST_PROJECTS);
```

#### 4. Division by Zero

**Symptoms:**
- Server crashes or returns NaN values
- Empty statistics in response

**Solution:**
This has been fixed in the latest version. Ensure you've deployed the latest code:
```bash
npm run deploy
```

The function now checks for empty arrays before calculating statistics.

---

### Error: Authentication Failed

**Symptoms:**
- `Authentication failed` or `Unauthorized` errors
- Cannot connect to Squid backend

**Cause:**
Missing or invalid SQUID_API_KEY.

**Solution:**
1. Get your API key from Squid Console:
   - Go to https://console.getsquid.ai/
   - Navigate to Settings → Developer Keys
   - Copy your API key

2. Set the environment variable:
   ```bash
   export SQUID_API_KEY="your-api-key-here"
   ```

3. Or add to `.env` file:
   ```
   SQUID_API_KEY=your-api-key-here
   ```

---

### Error: Knowledge Base Empty

**Symptoms:**
- `matchProjectsWithKnowledgeBase` returns empty array
- `isProjectGoodFitByKnowledgeBase` returns `confidence: 0`

**Diagnosis:**
Check if projects are stored in the knowledge base:
```typescript
const kb = squid.ai().knowledgeBase('projects-kb');
const contexts = await kb.listContexts();
console.log(`Projects in KB: ${contexts.length}`);
```

**Solution:**
1. Initialize knowledge base:
   ```bash
   npx tsx src/test-knowledge-base.ts
   ```

2. Or manually store projects:
   ```typescript
   await squid.executeFunction('initializeKnowledgeBase');
   await squid.executeFunction('storeProjects', yourProjects);
   ```

---

### Error: Threshold Too High

**Symptoms:**
- `isProjectGoodFitByKnowledgeBase` always returns `confidence: 0`
- No similar projects found despite having projects in KB

**Cause:**
The `similarityThreshold` parameter is too high.

**Solution:**
Lower the similarity threshold:
```typescript
// Instead of this (too strict):
await squid.executeFunction(
  'isProjectGoodFitByKnowledgeBase',
  project,
  profile,
  90,  // Too high
  60,
  10
);

// Use this (more reasonable):
await squid.executeFunction(
  'isProjectGoodFitByKnowledgeBase',
  project,
  profile,
  70,  // Better threshold
  60,
  10
);
```

**Recommended Thresholds:**
- `similarityThreshold`: 60-75 (70 is recommended)
- `fitThreshold`: 50-70 (60 is recommended)
- `limitSimilar`: 5-20 (10 is recommended)

---

### Error: Slow Performance

**Symptoms:**
- `isProjectGoodFitByKnowledgeBase` takes very long to execute
- Timeout errors

**Causes:**
1. Too many similar projects being analyzed
2. AI agent processing is slow

**Solutions:**

1. **Reduce `limitSimilar` parameter:**
   ```typescript
   await squid.executeFunction(
     'isProjectGoodFitByKnowledgeBase',
     project,
     profile,
     70,
     60,
     5   // Reduced from 10 to 5
   );
   ```

2. **Increase similarity threshold:**
   ```typescript
   await squid.executeFunction(
     'isProjectGoodFitByKnowledgeBase',
     project,
     profile,
     80,  // Higher threshold = fewer matches
     60,
     10
   );
   ```

3. **Use faster AI model:**
   - Go to Squid Console
   - Edit the `matching-agent`
   - Choose a faster model (e.g., gpt-3.5-turbo instead of gpt-4)

---

### Error: JSON Parse Error

**Symptoms:**
- `JSON.parse` errors in logs
- Some similar projects fail to analyze

**Cause:**
AI agent response is not valid JSON.

**Current Behavior:**
The function continues processing other projects even if one fails. The failed project is simply skipped.

**How to verify:**
Check the logs for messages like:
```
✗ Error analyzing similar project proj-xxx: Unexpected token...
```

**Solution:**
1. This is normal for occasional failures - the function handles it gracefully
2. If many projects fail, check your AI agent configuration:
   - Ensure `responseFormat: 'json_object'` is set
   - Update agent instructions to always return valid JSON

---

## Debugging Tips

### Enable Verbose Logging

The latest version includes console.log statements. Check your Squid backend logs:

1. In Squid Console:
   - Go to Backend → Logs
   - Look for messages like:
     ```
     Searching for similar projects in knowledge base...
     Found 8 similar projects
     Analyzing 6 relevant similar projects...
     ✓ proj-001: similarity=92, fit=88
     Successfully analyzed 6 projects
     ```

2. In local development:
   ```bash
   npm run start
   # Logs will appear in the terminal
   ```

### Test Step by Step

1. **Test Knowledge Base Initialization:**
   ```typescript
   const result = await squid.executeFunction('initializeKnowledgeBase');
   console.log(result); // Should see: { success: true, message: "..." }
   ```

2. **Test Storing Projects:**
   ```typescript
   const result = await squid.executeFunction('storeProjects', [
     { id: 'test-1', description: 'Test project' }
   ]);
   console.log(result); // Should see: { success: true, successCount: 1, ... }
   ```

3. **Test Matching:**
   ```typescript
   const results = await squid.executeFunction(
     'matchProjectsWithKnowledgeBase',
     'Company profile here',
     5,
     60
   );
   console.log(results.length); // Should see > 0
   ```

4. **Test Project Fit:**
   ```typescript
   const analysis = await squid.executeFunction(
     'isProjectGoodFitByKnowledgeBase',
     'New project description',
     'Company profile',
     70,
     60,
     10
   );
   console.log(analysis.isGoodFit, analysis.confidence);
   ```

### Check Squid Console

1. **Verify Functions Are Deployed:**
   - Backend → Functions
   - Should see all 7 functions listed

2. **Verify Knowledge Base Exists:**
   - AI → Knowledge Bases
   - Look for `projects-kb`

3. **Verify Agent Exists:**
   - AI → Agents
   - Look for `matching-agent`

4. **Check Contexts:**
   - AI → Knowledge Bases → projects-kb
   - View stored contexts (projects)

---

## Getting Help

If you're still experiencing issues:

1. **Check the logs:**
   - Squid Console → Backend → Logs
   - Look for error messages and stack traces

2. **Verify deployment:**
   ```bash
   npm run deploy
   # Wait for "Deployment successful"
   ```

3. **Run the test suite:**
   ```bash
   export SQUID_API_KEY="your-key"
   npx tsx src/test-knowledge-base.ts
   npx tsx src/test-project-fit.ts
   ```

4. **Check this repository's issues:**
   - Look for similar problems
   - Open a new issue with:
     - Error message
     - Steps to reproduce
     - Squid backend logs

5. **Squid Documentation:**
   - https://docs.squid.cloud
   - https://docs.squid.cloud/docs/ai/knowledge-base
