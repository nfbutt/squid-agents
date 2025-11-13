# Deployment Guide

## Quick Start

To deploy the backend and test the knowledge base functionality:

### 1. Deploy the Backend

```bash
cd rfp-tracker-backend
npm run deploy
```

Wait for the deployment to complete. You should see output like:
```
✓ Building backend...
✓ Deploying to Squid Cloud...
✓ Deployment successful!
```

### 2. Verify Deployment

Check the Squid Console:
1. Go to https://console.getsquid.ai/
2. Navigate to your app (rfz4m5p7nsqkan4818)
3. Go to "Backend" → "Functions"
4. Verify these functions are listed:
   - `initializeKnowledgeBase`
   - `storeProject`
   - `storeProjects`
   - `matchProjectsWithKnowledgeBase`
   - `matchProjects` (existing)
   - `matchProjectsBatch` (existing)

### 3. Run the Test

```bash
export SQUID_API_KEY="your-api-key"
npx tsx src/test-knowledge-base.ts
```

## Troubleshooting

### Error: FUNCTION_NOT_FOUND

**Cause:** Backend not deployed or deployment not complete.

**Solution:**
1. Run `npm run deploy` in the backend directory
2. Wait for deployment to complete
3. Refresh Squid Console to verify functions are listed
4. Try again

### Error: Knowledge base not found

**Cause:** Knowledge base not initialized.

**Solution:**
1. Run `initializeKnowledgeBase()` first
2. The test script does this automatically

### Error: Authentication failed

**Cause:** Missing or invalid SQUID_API_KEY.

**Solution:**
1. Get your API key from Squid Console
2. Set it: `export SQUID_API_KEY="your-key"`
3. Or add to `.env` file

## Development Workflow

### Local Development
```bash
npm run start
```
This runs the backend locally for testing.

### Deploy Changes
```bash
npm run deploy
```
Deploys to Squid Cloud.

### Test
```bash
# Test knowledge base
npx tsx src/test-knowledge-base.ts

# Test traditional matching
npx tsx src/test-matching.ts
```

## Next Steps

After successful deployment:
1. ✅ Backend functions are live
2. ✅ Knowledge base can be initialized
3. ✅ Projects can be stored
4. ✅ Semantic matching is ready
5. 🎯 Integrate into your frontend application
