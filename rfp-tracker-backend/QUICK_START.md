# Quick Start Guide

## Prerequisites

1. **Deploy the backend:**
   ```bash
   npm run deploy
   ```

2. **Create AI Agent in Squid Console:**
   - Go to https://console.getsquid.ai/
   - Navigate to AI → Agents
   - Create agent with ID: `matching-agent`

3. **Set API Key:**
   ```bash
   export SQUID_API_KEY="your-api-key"
   ```

---

## Setup (One-Time)

```typescript
import { Squid } from '@squidcloud/client';

const squid = new Squid({
  appId: 'rfz4m5p7nsqkan4818',
  region: 'us-east-1.aws',
  environmentId: 'dev',
  squidDeveloperId: process.env.SQUID_API_KEY,
});

// 1. Initialize knowledge base
await squid.executeFunction('initializeKnowledgeBase');

// 2. Store your projects
await squid.executeFunction('storeProjects', [
  { id: 'p1', description: 'Project 1 description...' },
  { id: 'p2', description: 'Project 2 description...' },
  // ... more projects
]);
```

---

## Usage

### 1. Match Company Profile Against All Projects

```typescript
const companyProfile = `
  We specialize in:
  - React, Next.js, TypeScript
  - Node.js, Express
  - AWS cloud services
  - PostgreSQL databases
`;

const matches = await squid.executeFunction(
  'matchProjectsWithKnowledgeBase',
  companyProfile,
  10,  // limit: return top 10 matches
  60   // threshold: minimum score for "good fit"
);

matches.forEach(match => {
  console.log(`${match.id}: ${match.score}% - ${match.isGoodFit ? 'GOOD FIT' : 'NOT A FIT'}`);
  console.log(`Reason: ${match.reasoning}`);
});
```

**Output:**
```
proj-001: 92% - GOOD FIT
Reason: Strong alignment with React, Node.js, and AWS expertise...

proj-003: 88% - GOOD FIT
Reason: Perfect match for healthcare technology stack...
```

---

### 2. Check If New Project Is Good Fit

```typescript
const newProject = `
  Project: E-commerce Platform
  Requirements:
  - React/Next.js frontend
  - Node.js backend
  - PostgreSQL database
  - AWS hosting
`;

const analysis = await squid.executeFunction(
  'isProjectGoodFitByKnowledgeBase',
  newProject,
  companyProfile,
  70,  // similarityThreshold
  60,  // fitThreshold
  10   // limitSimilar
);

if (analysis.isGoodFit) {
  console.log(`✅ GOOD FIT (${analysis.confidence}% confidence)`);
  console.log(analysis.reasoning);
  // Proceed with proposal
} else {
  console.log(`❌ NOT A GOOD FIT (${analysis.confidence}% confidence)`);
  console.log(analysis.reasoning);
  // Skip or deprioritize
}

console.log(`\nBased on ${analysis.statistics.totalSimilarProjects} similar projects`);
console.log(`${analysis.statistics.goodFitProjects} are good fits for your company`);
```

**Output:**
```
✅ GOOD FIT (75% confidence)
This project is a GOOD FIT for your company. Analysis of 8 similar projects
shows that 6 (75%) are a good match for your capabilities, with an average
fit score of 82/100. This indicates strong alignment between your company
profile and projects of this type.

Based on 8 similar projects
6 are good fits for your company
```

---

### 3. Add New Projects to Knowledge Base

```typescript
// Single project
await squid.executeFunction('storeProject',
  {
    id: 'proj-new',
    description: 'New project description...'
  },
  {
    title: 'New E-commerce Platform',
    budget: 50000,
    timeline: '3 months'
  }
);

// Multiple projects
await squid.executeFunction('storeProjects', [
  { id: 'p10', description: '...' },
  { id: 'p11', description: '...' },
]);
```

---

## Test Scripts

### Test Knowledge Base
```bash
npx tsx src/test-knowledge-base.ts
```

**What it does:**
- Initializes knowledge base
- Stores 8 test projects
- Performs semantic matching
- Compares performance with traditional approach

### Test Project Fit Analysis
```bash
npx tsx src/test-project-fit.ts
```

**What it does:**
- Tests 3 different project types
- Shows similarity analysis
- Demonstrates fit determination
- Provides detailed statistics

---

## React Integration

```typescript
import { useSquid } from '@squidcloud/react';
import { useState } from 'react';

function ProjectMatcher() {
  const squid = useSquid();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkProjectFit = async (newProject: string, companyProfile: string) => {
    setLoading(true);
    try {
      const analysis = await squid.executeFunction(
        'isProjectGoodFitByKnowledgeBase',
        newProject,
        companyProfile,
        70,
        60,
        10
      );
      setResult(analysis);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <p>Analyzing...</p>
      ) : result ? (
        <div>
          <h2>{result.isGoodFit ? '✅ Good Fit' : '❌ Not a Good Fit'}</h2>
          <p>Confidence: {result.confidence}%</p>
          <p>{result.reasoning}</p>
          <h3>Statistics</h3>
          <ul>
            <li>Similar Projects: {result.statistics.totalSimilarProjects}</li>
            <li>Good Fits: {result.statistics.goodFitProjects}</li>
            <li>Average Score: {result.statistics.averageFitScore}/100</li>
          </ul>
        </div>
      ) : (
        <button onClick={() => checkProjectFit(projectText, profileText)}>
          Check Fit
        </button>
      )}
    </div>
  );
}
```

---

## Function Reference

| Function | Purpose | Parameters |
|----------|---------|------------|
| `initializeKnowledgeBase()` | Setup KB (run once) | None |
| `storeProject(project, metadata?)` | Add single project | project, optional metadata |
| `storeProjects(projects)` | Add multiple projects | array of projects |
| `matchProjectsWithKnowledgeBase(profile, limit?, threshold?)` | Find matching projects | company profile, limit, threshold |
| `isProjectGoodFitByKnowledgeBase(project, profile, ...)` | Check if project fits | project, profile, thresholds |

---

## Parameter Recommendations

### For `matchProjectsWithKnowledgeBase`:
- `limit`: 5-20 (default: 10)
- `threshold`: 50-70 (default: 60)

### For `isProjectGoodFitByKnowledgeBase`:
- `similarityThreshold`: 60-80 (default: 70)
- `fitThreshold`: 50-70 (default: 60)
- `limitSimilar`: 5-15 (default: 10)

**Lower thresholds** = More results, more lenient matching
**Higher thresholds** = Fewer results, stricter matching

---

## Troubleshooting

| Error | Quick Fix |
|-------|-----------|
| `FUNCTION_NOT_FOUND` | Run `npm run deploy` |
| `Internal Server Error` | Ensure `matching-agent` exists in Squid Console |
| `No similar projects found` | Lower `similarityThreshold` or add more projects |
| `confidence: 0` | Check if projects are stored in knowledge base |

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed solutions.

---

## Next Steps

1. ✅ Deploy backend: `npm run deploy`
2. ✅ Create AI agent in Squid Console
3. ✅ Run test scripts to verify setup
4. 🎯 Integrate into your application
5. 📊 Monitor performance and adjust thresholds

For detailed documentation, see [KNOWLEDGE_BASE_GUIDE.md](./KNOWLEDGE_BASE_GUIDE.md)
