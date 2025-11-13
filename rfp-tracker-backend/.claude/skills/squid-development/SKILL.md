---
name: Squid Development
description: Provides comprehensive, code-verified knowledge about developing applications with Squid. Use this skill proactively before writing, editing, or creating any code that uses Squid's Client SDK, Backend SDK, or CLI to ensure compliance with Squid's APIs and best practices.
---

# Squid Development Skill (Verified)

This skill provides comprehensive, code-verified knowledge about developing applications with Squid.

## Overview

Squid is a backend-as-a-service platform that provides:
- **Client SDK** (`@squidcloud/client`) - TypeScript/JavaScript SDK for frontend
- **Backend SDK** (`@squidcloud/backend`) - TypeScript SDK with decorators for backend
- **CLI** (`@squidcloud/cli`) - Local development and deployment tools
- **Built-in integrations** - Databases, queues, storage, AI, APIs

## CLI Commands

### Installation
```bash
npm install -g @squidcloud/cli
```

### `squid init <project-name>`
Creates new backend project with `.env` and example service.

```bash
squid init backend --appId YOUR_APP_ID --apiKey YOUR_API_KEY --environmentId dev --squidDeveloperId YOUR_DEV_ID --region us-east-1.aws
```

### `squid start`
Runs backend locally with hot-reload, connects to Squid Cloud via reverse proxy.

```bash
cd backend
squid start
```

**Extended logging in `.env`:**
```env
SQUID_LOG_TYPES=QUERY,MUTATION,AI,API,ERROR
```

### `squid deploy`
Builds and deploys to Squid Cloud.

```bash
squid deploy [--apiKey KEY] [--environmentId prod] [--skipBuild]
```

### `squid build`
Builds backend project.

```bash
squid build [--dev] [--skip-version-check]
```

## Client SDK

### Where Can You Use the SDK?

The Squid Client SDK can be instantiated in various environments:
- **Web applications** (vanilla JavaScript, React, Vue, Angular, etc.)
- **Node.js servers** (Express, Fastify, etc.)
- **Mobile applications** (React Native, etc.)
- **Desktop applications** (Electron, etc.)

**Important:** When writing backend code that runs on Squid's infrastructure, the Squid client is **already initialized and available** for you (see Backend SDK section). You don't need to manually create a new instance.

### Initialization

#### Configuration Options

**Required Parameters:**
- **`appId`** (string): Your Squid application identifier. Can be found in the Squid Console.
- **`region`** (string): The region where your Squid application is deployed:
  - AWS regions: `'us-east-1.aws'`, `'ap-south-1.aws'`, `'eu-central-1.aws'`
  - GCP regions: `'us-central1.gcp'`

**Optional Parameters:**
- **`apiKey`** (string): API key that bypasses security rules and provides full administrative access.
  - **IMPORTANT**: Has **complete control over your application** and bypasses all security rules
  - Only use in trusted environments (backend servers, admin tools, development)
  - **Never expose in client-side code** (web browsers, mobile apps)
- **`authProvider`** (object): Authentication provider that supplies OAuth2.0 tokens for the current user
  - `integrationId` (string): The ID of your auth integration
  - `getToken` (function): Returns a promise that resolves to the user's auth token (or undefined if not authenticated)
  - Authentication details are **available in backend functions** via the execution context
- **`environmentId`** (string): Environment identifier (dev, staging, prod). Defaults to production.
- **`squidDeveloperId`** (string): Your developer identifier, used for local development and debugging.
- **`consoleRegion`** (string): Console region (optional)

#### Basic Setup

```typescript
import { Squid } from '@squidcloud/client';

const squid = new Squid({
  appId: 'your-app-id',
  region: 'us-east-1.aws',
  environmentId: 'dev' // optional
});
```

#### Authentication: API Key vs Auth Provider

**Using API Key (Server-Side Only):**
```typescript
const squid = new Squid({
  appId: 'your-app-id',
  region: 'us-east-1.aws',
  apiKey: 'your-api-key' // Full admin access
});
```
- **Use cases**: Backend servers, admin tools, scripts, development environments
- **Security**: Has full control - bypasses all security rules
- **Warning**: Never use in client-side code

**Using Auth Provider (Client-Side):**
```typescript
const squid = new Squid({
  appId: 'your-app-id',
  region: 'us-east-1.aws',
  authProvider: {
    integrationId: 'auth-integration-id',
    getToken: async () => {
      // Return user's OAuth token
      return await getCurrentUserToken();
    }
  }
});
```
- **Use cases**: Web apps, mobile apps, any user-facing application
- **Security**: Respects security rules based on authenticated user
- **Backend access**: User authentication details are available in backend functions through the execution context

**Setting Auth Provider After Initialization:**
```typescript
const squid = new Squid({
  appId: 'your-app-id',
  region: 'us-east-1.aws'
});

// Later, when user logs in
squid.setAuthProvider({
  integrationId: 'auth-integration-id',
  getToken: async () => userAuthToken
});
```

### Database & Data Management

Squid provides database functionality similar to Firestore but more powerful, with collections, document references, and real-time capabilities. Squid supports multiple database types including NoSQL databases (like MongoDB) and relational databases (like PostgreSQL, MySQL).

#### Security Rules

Every database operation in Squid can be secured using **security rules**. Security rules are backend functions decorated with `@secureDatabase` or `@secureCollection` that contain business logic to determine whether an operation is allowed.

```typescript
// Example security rule for a collection (read operations)
@secureCollection('users', 'read')
async canReadUsers(context: QueryContext<User>): Promise<boolean> {
  // Your business logic here
  // context.collectionName, context.integrationId, context.limit, etc.
  return true; // or false based on your logic
}

// Example security rule for mutations (insert, update, delete)
@secureCollection('users', 'update')
async canUpdateUsers(context: MutationContext): Promise<boolean> {
  // Access document before and after the mutation
  const before = context.before;
  const after = context.after;

  // Check if specific paths were affected
  if (context.affectsPath('email')) {
    return false; // Don't allow email changes
  }

  return true;
}

// Database-wide security rule
@secureDatabase('insert', 'my-integration-id')
async canInsertAnywhere(context: MutationContext): Promise<boolean> {
  // Your business logic here
  return context.after?.createdBy === 'admin';
}
```

These decorated functions return a boolean (or `Promise<boolean>`) indicating whether the operation is allowed. The developer has full control to implement any business logic needed for authorization.

**Context types:**
- `QueryContext` - Used for 'read' and 'all' operations (exported from `@squidcloud/backend`)
- `MutationContext` - Used for 'insert', 'update', 'delete' operations (exported from `@squidcloud/backend`)

Security decorators (`@secureDatabase`, `@secureCollection`) are exported from `@squidcloud/backend`.

#### Collection Access

A collection represents a set of documents (similar to a table in relational databases or a collection in NoSQL databases).

```typescript
// Get collection reference in the built-in database
const users = squid.collection<User>('users');

// Get collection reference in a specific integration
const orders = squid.collection<Order>('orders', 'postgres-db');
```

**Type parameter**: The generic type `<T>` defines the structure of documents in the collection.

**Document References - The `doc()` method has different behaviors:**

**1. No parameters - `doc()`**
Generates a new document ID (useful for creating new documents):
```typescript
// For built_in_db without schema - generates a random ID
const newDocRef = collection.doc();
await newDocRef.insert({ name: 'John', age: 30 });

// For other integrations - creates a placeholder that gets resolved on insert
const newDocRef = collection.doc();
```

**2. String parameter - `doc(stringId)`**
**Only supported for `built_in_db` integration without a defined schema:**
```typescript
// Valid only for built_in_db collections without schema
const docRef = collection.doc('my-doc-id');
const docRef = collection.doc('user-12345');
```
**Important**: For collections with defined schemas or non-built_in_db integrations, you must use object format.

**3. Object parameter - `doc({id: value})`**
Used for collections with defined primary keys. The object maps primary key field names to their values:
```typescript
// Single primary key field "id"
const docRef = collection.doc({ id: 'user-123' });

// Single primary key field "userId"
const docRef = collection.doc({ userId: 42 });

// Composite primary key (id1, id2)
const docRef = collection.doc({ id1: 'part1', id2: 'part2' });

// Partial primary key - missing fields generated on server if supported
const docRef = collection.doc({ id1: 'part1' }); // id2 generated on insert
```

**Key points about document IDs:**
- For `built_in_db` without schema: can use string IDs or object format
- For `built_in_db` with schema: must use object format matching primary key fields
- For other integrations: must use object format matching primary key fields
- Partial primary keys: missing fields may be auto-generated on insert (if integration supports it)
- Empty `doc()`: generates a placeholder ID that gets resolved when document is created

```typescript
// Examples:

// Insert
await userDoc.insert({ name: 'John', email: 'john@example.com' });

// Update (partial)
await userDoc.update({ name: 'Jane' });

// Update specific path
await userDoc.setInPath('address.street', 'Main St');

// Delete specific path
await userDoc.deleteInPath('tempData');

// Delete document
await userDoc.delete();

// Get data (promise)
const userData = await userDoc.snapshot();
console.log(userData);

// Get data (observable - realtime)
userDoc.snapshots().subscribe(data => {
  console.log(data);
});

// Get cached data (no server fetch)
const cached = userDoc.peek();

// Bulk operations
await users.insertMany([
  { id: 'user-1', data: { name: 'Alice' } },
  { id: 'user-2', data: { name: 'Bob' } }
]);

await users.deleteMany(['user-1', 'user-2']);
```

#### Real-time Subscriptions

Squid provides real-time data synchronization similar to Firestore. Subscribe to document or query changes and receive updates automatically.

**Document Subscriptions:**
```typescript
// Subscribe to document changes
const subscription = docRef.snapshots().subscribe((userData) => {
  if (userData) {
    console.log('Document updated:', userData);
  } else {
    console.log('Document deleted or does not exist');
  }
});

// Unsubscribe when done
subscription.unsubscribe();
```

**Query Subscriptions:**
```typescript
// Subscribe to query results - ALWAYS use dereference()
const subscription = collection
  .query()
  .eq('status', 'active')
  .gte('age', 18)
  .dereference()  // Important: Converts DocumentReferences to actual data
  .snapshots()
  .subscribe((users) => {
    console.log('Active users updated:', users);
    // users is Array<User> with actual data
  });

// Unsubscribe when done
subscription.unsubscribe();
```

**Real-time Updates:**
When data changes on the server (from any client or backend operation):
- Document subscriptions receive the updated document data
- Query subscriptions receive the updated query results
- Updates are pushed to clients via WebSocket connections
- Changes are automatically reflected in the local data

**Important**: Always unsubscribe from subscriptions when they're no longer needed to prevent memory leaks.

### Database - Queries

**ALL Available Operators:**
- Comparison: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`
- Arrays: `in`, `nin`, `arrayIncludesSome`, `arrayIncludesAll`, `arrayNotIncludes`
- Patterns: `like`, `notLike` (% = any chars, _ = one char)

```typescript
// Basic query
const activeUsers = await users.query()
  .eq('status', 'active')
  .gt('age', 18)
  .sortBy('name', true) // true = ascending
  .limit(100) // max 20000, default 1000
  .snapshot();

activeUsers.data.forEach(doc => {
  console.log(doc.data); // Document data
});

// Realtime query
users.query()
  .eq('status', 'active')
  .snapshots().subscribe(snapshot => {
    snapshot.data.forEach(doc => console.log(doc.data));
  });

// Pattern matching
const results = await users.query()
  .like('email', '%.com') // case-insensitive by default
  .snapshot();

// Array operators
const tagged = await posts.query()
  .in('category', ['tech', 'news'])
  .arrayIncludesSome('tags', ['urgent', 'important'])
  .snapshot();

// Using where() method (all operators above are shortcuts for where)
const results1 = await users.query().eq('status', 'active').snapshot();
const results2 = await users.query().where('status', '==', 'active').snapshot();
// These are equivalent

// OR queries - combine multiple queries with OR logic
const query1 = users.query().eq('status', 'active');
const query2 = users.query().eq('status', 'pending');
const orResults = await users.or(query1, query2)
  .dereference()
  .snapshot();
// Returns documents matching either query
// Note: Results are merged and deduplicated

// Multiple sort
const sorted = await users.query()
  .sortBy('lastName', true)
  .sortBy('firstName', true)
  .limit(50)
  .snapshot();

// Join Queries - combine data from multiple collections
// Start with joinQuery() and alias
const results = await teachers
  .joinQuery('teacher')  // Alias for teachers collection
  .join(
    students.query(),
    'students',           // Alias for students collection
    { left: 'id', right: 'teacherId' }  // Join condition
  )
  .dereference()  // Important: converts refs to actual data
  .snapshot();
// Results: Array<{ teacher: Teacher, students?: Student }>

// Inner join (only matching records)
const innerResults = await teachers
  .joinQuery('teacher')
  .join(
    students.query(),
    'students',
    { left: 'id', right: 'teacherId' },
    { isInner: true }  // Inner join option
  )
  .dereference()
  .snapshot();

// Multi-level joins
const threeWay = await collection1
  .joinQuery('a')
  .join(collection2.query(), 'b', { left: 'id', right: 'parentId' })
  .join(collection3.query(), 'c', { left: 'id', right: 'grandParentId' })
  .dereference()
  .snapshot();

// Grouped joins (nests one-to-many as arrays)
const grouped = await teachers
  .joinQuery('teacher')
  .join(students.query(), 'students', { left: 'id', right: 'teacherId' })
  .grouped()
  .dereference()
  .snapshot();
// Results: Array<{ teacher: Teacher, students: Student[] }>

// Dereference - Converts DocumentReferences to actual data
// WITHOUT dereference: returns Array<DocumentReference<User>>
const refs = await users.query().eq('active', true).snapshot();
// refs.data[0].data to access actual data

// WITH dereference: returns Array<User> directly
const userData = await users.query()
  .eq('active', true)
  .dereference()
  .snapshot();
// userData[0] is the actual user object

// ALWAYS use dereference() for:
// - Real-time subscriptions (makes working with data easier)
// - When you need document data directly
// DON'T use dereference() if:
// - You need DocumentReference methods like .update() or .delete()

// Pagination
const pagination = users.query()
  .sortBy('createdAt', false)
  .dereference()
  .paginate({
    pageSize: 50,       // Number of items per page (default: 100)
    subscribe: true     // Subscribe to real-time updates (default: true)
  });

const firstPage = await pagination.first();  // Jump to first page
const nextPage = await pagination.next();    // Go to next page
const prevPage = await pagination.prev();    // Go to previous page

// Check pagination state
console.log(firstPage.hasNext);  // boolean
console.log(firstPage.hasPrev);  // boolean

// Watch changes
users.query()
  .eq('status', 'active')
  .changes()
  .subscribe(changes => {
    console.log('Inserts:', changes.inserts);
    console.log('Updates:', changes.updates);
    console.log('Deletes:', changes.deletes);
  });
```

**Note:** `offset()` does NOT exist - use `paginate()` for pagination.

### Database - Transactions

```typescript
await squid.runInTransaction(async (txId) => {
  const userRef = squid.collection('users').doc('user-1');
  const accountRef = squid.collection('accounts').doc('acc-1');

  // Pass txId as last parameter to each operation
  // Use incrementInPath/decrementInPath for numeric operations
  await userRef.decrementInPath('balance', 100, txId);
  await accountRef.incrementInPath('balance', 100, txId);

  // Both commit together or rollback together
});
```

### Database - Numeric Operations

```typescript
// Increment/decrement
await userDoc.incrementInPath('loginCount', 1);
await userDoc.decrementInPath('credits', 50);

// For arrays/objects, use update() with full new value
const currentData = await userDoc.snapshot();
await userDoc.update({
  tags: [...currentData.tags, 'newTag'],
  notifications: [...currentData.notifications, { msg: 'Hi' }]
});
```

### Database - Native Queries

```typescript
// SQL (PostgreSQL, MySQL, etc.) - uses ${param} syntax
const users = await squid.executeNativeRelationalQuery<User[]>(
  'postgres-db',
  'SELECT * FROM users WHERE age > ${minAge}',
  { minAge: 18 }
);

// MongoDB aggregation
const orders = await squid.executeNativeMongoQuery<Order[]>(
  'mongo-db',
  'orders',
  [
    { $match: { status: 'completed' } },
    { $group: { _id: '$userId', total: { $sum: '$amount' } } }
  ]
);

// Elasticsearch
const products = await squid.executeNativeElasticQuery(
  'elastic-db',
  'products',
  { query: { match: { name: 'laptop' } } },
  '_search', // endpoint (optional)
  'GET' // method (optional)
);

// Pure (Finos Legend Pure Language) - uses ${param} syntax
const items = await squid.executeNativePureQuery(
  'my-db',
  'from products->filter(p | $p.price < ${maxPrice})',
  { maxPrice: 1000 }
);
```

### Database - Security (@secureDatabase, @secureCollection)

Secure your database operations with backend decorators. These are backend-only decorators that define who can access your data.

**Backend - Secure entire database:**
```typescript
import { SquidService, secureDatabase, QueryContext, MutationContext } from '@squidcloud/backend';

export class MyService extends SquidService {
  @secureDatabase('read')
  allowRead(context: QueryContext<User>): boolean {
    const userId = this.getUserAuth()?.userId;
    if (!userId) return false;
    return context.isSubqueryOf('userId', '==', userId);
  }

  @secureDatabase('write')
  allowWrite(context: MutationContext<User>): boolean {
    return this.isAuthenticated();
  }

  @secureDatabase('all')
  allowAll(): boolean {
    return this.isAuthenticated();
  }
}
```

**Types:** `'read'`, `'write'`, `'update'`, `'insert'`, `'delete'`, `'all'`

**Backend - Secure specific collection:**
```typescript
// QueryContext methods (for 'read' operations)
@secureCollection('users', 'read')
allowUserRead(context: QueryContext): boolean {
  const userId = this.getUserAuth()?.userId;
  if (!userId) return false;
  // Check if query filters on a specific field
  return context.isSubqueryOf('id', '==', userId);
}

// MutationContext methods (for 'insert', 'update', 'delete' operations)
@secureCollection('users', 'update')
allowUserUpdate(context: MutationContext<User>): boolean {
  const userId = this.getUserAuth()?.userId;
  if (!userId) return false;

  // context.before: document state before mutation
  // context.after: document state after mutation

  // Check if specific paths were affected
  if (context.affectsPath('email')) {
    return false; // Don't allow email changes
  }

  // Check ownership
  return context.after?.id === userId;
}
```

**Context types (exported from `@squidcloud/backend`):**
- `QueryContext<T>` - Used for 'read' and 'all' operations
  - `isSubqueryOf(field, operator, value)` - Check if query filters on field
  - `collectionName`, `integrationId`, `limit` properties
- `MutationContext<T>` - Used for 'insert', 'update', 'delete' operations
  - `affectsPath(path)` - Check if specific field path was modified
  - `before` - Document before mutation (undefined for insert)
  - `after` - Document after mutation (undefined for delete)

### Backend Functions (@executable)

Backend functions allow you to write custom server-side logic that can be called from the client.

**Backend - Define the function:**
```typescript
import { SquidService, executable, SquidFile } from '@squidcloud/backend';

export class MyService extends SquidService {
  @executable()
  async greetUser(name: string): Promise<string> {
    return `Hello, ${name}`;
  }

  @executable()
  async uploadFile(file: SquidFile): Promise<Result> {
    console.log(file.originalName, file.size, file.data);
    return { success: true };
  }
}
```

**Client - Call the function:**
```typescript
// Execute @executable() decorated function
const result = await squid.executeFunction('greetUser', 'John');
const typedResult = await squid.executeFunction<string>('greetUser', 'John');

// With headers
const result = await squid.executeFunctionWithHeaders(
  'processPayment',
  { 'X-Custom-Header': 'value' },
  paymentData
);
```

### Webhooks (@webhook)

Webhooks allow you to create publicly accessible HTTP endpoints that can receive data from external services.

**Backend - Define the webhook:**
```typescript
import { SquidService, webhook, WebhookRequest } from '@squidcloud/backend';

export class MyService extends SquidService {
  @webhook('github-events')
  async handleGithub(request: WebhookRequest): Promise<any> {
    console.log(request.body);
    console.log(request.headers);
    console.log(request.queryParams);
    console.log(request.httpMethod); // 'post' | 'get' | 'put' | 'delete'
    console.log(request.files);

    return this.createWebhookResponse({ received: true }, 200);
  }
}
```

**Webhook URL:** `https://<appId>.<region>.squid.cloud/webhooks/<webhook-id>`

**Client - Call webhook programmatically (optional):**
```typescript
// Usually webhooks are called by external services, but you can also call them from client
const result = await squid.executeWebhook<Response>('github-events', {
  headers: { 'X-GitHub-Event': 'push' },
  queryParams: { ref: 'main' },
  body: { commits: [...] },
  files: [file1, file2]
});
```

### AI - Supported Models

Squid supports multiple AI providers and models for different use cases:

**Chat Models** (for AI Agents, AI Query, etc.):

*OpenAI:*
- `o1`, `o3`, `o3-mini`, `o4-mini`
- `gpt-5`, `gpt-5-mini`, `gpt-5-nano`
- `gpt-4.1` (default), `gpt-4.1-mini`, `gpt-4.1-nano`
- `gpt-4o`, `gpt-4o-mini`

*Anthropic (Claude):*
- `claude-3-7-sonnet-latest`
- `claude-haiku-4-5-20251001`
- `claude-opus-4-20250514`, `claude-opus-4-1-20250805`
- `claude-sonnet-4-20250514`, `claude-sonnet-4-5-20250929`

*Google (Gemini):*
- `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-lite`

*xAI (Grok):*
- `grok-3`, `grok-3-fast`, `grok-3-mini`, `grok-3-mini-fast`
- `grok-4`, `grok-4-fast-reasoning`, `grok-4-fast-non-reasoning`
- Note: `grok-3-mini` is ~10x less expensive than `grok-3`
- Note: `*-fast` models are ~2x more expensive and only marginally faster

**Embedding Models** (for Knowledge Bases):
- `text-embedding-3-small` (OpenAI, default) - 8,192 token limit
- `voyage-3-large` (Voyage) - 32,000 token limit

**Image Generation Models:**
- `dall-e-3` (OpenAI)
- `stable-diffusion-core` (Stability)
- `flux-pro-1.1`, `flux-kontext-pro` (Flux)

**Audio Models:**

*Transcription:*
- `whisper-1`
- `gpt-4o-transcribe`, `gpt-4o-mini-transcribe`

*Text-to-Speech:*
- `tts-1`, `tts-1-hd`, `gpt-4o-mini-tts`

### AI - Agents

AI Agents are powerful, configurable AI assistants that can interact with your data, call functions, connect to integrations, and collaborate with other agents.

**An AI Agent can:**
- Maintain conversation history (**memory is enabled by default**)
- Call backend functions decorated with `@aiFunction`
- Query databases and APIs through connected integrations
- Search knowledge bases for relevant information
- Collaborate with other AI agents
- Process voice input and generate voice output
- Accept files as part of chat requests

**Creating and Managing Agents:**

```typescript
const aiClient = squid.ai();

// Get the built-in agent (no ID required)
const builtInAgent = aiClient.agent();

// Get a custom agent by ID
const myAgent = aiClient.agent('my-agent-id');

// Get an agent with an Agent API key (allows calling without App API key, bypasses @secureAiAgent methods)
const agentWithKey = aiClient.agent('my-agent-id', {
  apiKey: 'your-agent-api-key'
});

// Create or update an agent
await myAgent.upsert({
  description: 'Customer support assistant',
  isPublic: false,  // Whether the agent is publicly accessible
  auditLog: true,   // Enable audit logging for compliance
  options: {
    model: 'gpt-4o', // or 'claude-sonnet-4-5-20250929', 'gemini-2.5-flash'
    instructions: 'You are a helpful customer support assistant. Be concise and professional.',
    temperature: 0.7
  }
});

// Get agent details
const agentInfo = await myAgent.get();
console.log(agentInfo.id, agentInfo.description, agentInfo.options.model);

// Update specific properties
await myAgent.updateInstructions('You are a technical support specialist.');
await myAgent.updateModel('claude-sonnet-4-5-20250929');
await myAgent.updateGuardrails(['no-harmful-content']);

// Delete an agent
await myAgent.delete();

// List all agents
const agents = await squid.ai().listAgents();
agents.forEach(agent => console.log(`${agent.id}: ${agent.description}`));
```

**Agent Lifecycle:**
1. **Creation** - Use `upsert()` to create a new agent with an ID
2. **Active** - Agent can process requests
3. **Update** - Use `upsert()` or specific update methods
4. **Deletion** - Use `delete()` to permanently remove the agent

**Important Notes:**
- Agent IDs are permanent - once created, you cannot change the ID
- Deleting an agent does not delete associated chat history
- The built-in agent (accessed via `agent()` with no ID) cannot be deleted
- **Agent API Keys**: You can pass an options object with an `apiKey` when calling `agent()`:
  - Allows calling agent methods without requiring an App API key
  - Bypasses any `@secureAiAgent` security methods when calling agent ask functions
  - Useful for direct agent access without app-level authentication

**Connecting Resources to Agents:**

Agents become powerful when connected to resources. You can connect agents to:
- **Other AI agents** (`connectedAgents`) - Agent collaboration
- **Backend functions** (`functions`) - Custom logic via `@aiFunction` decorators
- **Integrations** (`connectedIntegrations`) - Database/API queries
- **Knowledge bases** (`connectedKnowledgeBases`) - RAG (Retrieval Augmented Generation)

**1. Connected Agents (`connectedAgents`):**

Allow one agent to call another agent as a specialized sub-task handler.

```typescript
// Define connected agents in upsert or per-request
const response = await agent.ask('Analyze our sales data and send report to team', {
  connectedAgents: [
    {
      agentId: 'data-analyst-agent',
      description: 'Analyzes sales data and generates reports'
    },
    {
      agentId: 'email-sender-agent',
      description: 'Sends emails to team members'
    }
  ]
});

// The main agent can now call these sub-agents when needed
// Agent orchestration happens automatically based on the prompt
```

**2. Functions (`functions`):**

Connect backend functions decorated with `@aiFunction` that the agent can call.

```typescript
// Backend function
@aiFunction('Gets current inventory for a product', [
  { name: 'productId', type: 'string', required: true, description: 'Product ID' }
])
async getInventory({ productId }: { productId: string }): Promise<number> {
  return await db.inventory.get(productId);
}

// Client - Agent uses the function
const response = await agent.ask('How many units of product-123 do we have?', {
  functions: ['getInventory'] // Function name or ID
});
// Agent automatically calls getInventory() and includes result in response

// With predefined parameters (hidden from AI)
const response = await agent.ask('Send notification', {
  functions: [
    {
      functionId: 'sendEmail',
      context: { apiKey: 'secret-key' } // Passed to function but hidden from AI
    }
  ]
});
```

**3. Connected Integrations (`connectedIntegrations`):**

Connect database or API integrations so the agent can query them directly.

```typescript
const response = await agent.ask('Show me active users from last week', {
  connectedIntegrations: [
    {
      integrationId: 'postgres-db',
      integrationType: 'database',
      description: 'Main application database with users, orders, and products',
      instructions: 'Only query the users table unless explicitly asked otherwise',
      options: {
        // Integration-specific options (varies by integration type)
      }
    },
    {
      integrationId: 'stripe-api',
      integrationType: 'api',
      description: 'Stripe payment API for retrieving payment information'
    }
  ]
});

// Agent can now query the database and API to answer questions
```

**4. Connected Knowledge Bases (`connectedKnowledgeBases`):**

Connect knowledge bases for RAG (Retrieval Augmented Generation) - agent retrieves relevant context before answering.

```typescript
const response = await agent.ask('What is our return policy?', {
  connectedKnowledgeBases: [
    {
      knowledgeBaseId: 'company-policies-kb',
      description: 'Use this when asked about company policies, procedures, or guidelines'
    },
    {
      knowledgeBaseId: 'product-docs-kb',
      description: 'Use this when asked about product features, specifications, or usage'
    }
  ]
});

// Agent searches knowledge bases for relevant information before answering
```

**Complete Agent Chat Options:**

```typescript
const agent = squid.ai().agent('my-agent');

// Chat (streaming) - Returns RxJS Observable
// IMPORTANT: Streaming behavior:
// - NO connected resources: streams token-by-token
// - HAS connected resources: emits ONCE with complete response
const chatObs = agent.chat('What is your return policy?', {
  // Memory management
  memoryOptions: {
    memoryMode: 'read-write', // 'none' | 'read-only' | 'read-write'
    memoryId: 'user-123',     // Unique per user/session
    expirationMinutes: 1440   // 24 hours
  },

  // Connected resources (can also be set on agent.upsert)
  connectedAgents: [{ agentId: 'specialist-agent', description: 'Handles X' }],
  functions: ['function1', 'function2'], // or with context: [{ functionId: 'fn', context: {...} }]
  connectedIntegrations: [{ integrationId: 'db', integrationType: 'database', description: '...' }],
  connectedKnowledgeBases: [{ knowledgeBaseId: 'kb1', description: 'When to use this KB' }],

  // Model & generation
  model: 'gpt-4o', // Override agent's default model
  temperature: 0.7,
  maxTokens: 4000,
  maxOutputTokens: 2000,
  instructions: 'Additional instructions for this request only',
  responseFormat: 'json_object', // or 'text'
  verbosity: 'medium', // 'low' | 'medium' | 'high' (OpenAI only)
  reasoningEffort: 'high', // 'minimal' | 'low' | 'medium' | 'high' (for reasoning models)

  // Context & RAG
  disableContext: false, // Disable all context
  enablePromptRewriteForRag: false, // Rewrite prompt for better RAG results
  includeReference: false, // Include source references in response
  contextMetadataFilterForKnowledgeBase: {
    'kb-id': { category: 'documentation' } // Filter KB contexts by metadata
  },

  // Guardrails & quotas
  guardrails: ['no-harmful-content', 'no-pii'], // Preset safety rules
  quotas: {
    maxAiCallStackSize: 5 // Max depth for nested agent calls
  },

  // Files & voice
  fileUrls: [
    { id: 'file1', type: 'image', purpose: 'context', url: 'https://...', description: 'Product image' }
  ],
  voiceOptions: {
    modelName: 'tts-1',
    voice: 'alloy', // alloy, ash, ballad, coral, echo, fable, onyx, nova, sage, shimmer, verse
    speed: 1.0
  },

  // Advanced
  smoothTyping: true, // Smooth typing effect (default: true)
  useCodeInterpreter: 'llm', // 'none' | 'llm' (OpenAI/Gemini only)
  executionPlanOptions: {
    enabled: true, // Agent plans which resources to use
    model: 'gpt-4o',
    reasoningEffort: 'high'
  },
  agentContext: { userId: '123', role: 'admin' }, // Global context passed to all functions
  includeMetadata: false // Include context metadata in response
});

chatObs.subscribe(text => {
  console.log(text);
});

// Ask (complete response - same options as chat)
const response = await agent.ask('Question?', { /* same options */ });

// Ask with annotations (includes file references, citations)
const result = await agent.askWithAnnotations('Question?');
console.log(result.responseString);
console.log(result.annotations);

// Voice responses
const voiceResult = await agent.askWithVoiceResponse('Hello', {
  voiceOptions: { modelName: 'tts-1', voice: 'alloy', speed: 1.0 }
});
console.log(voiceResult.responseString);
console.log(voiceResult.voiceResponseFile);

// Transcribe audio and chat
const transcribeResult = await agent.transcribeAndChat(audioFile);
console.log(transcribeResult.transcribedPrompt);
transcribeResult.responseStream.subscribe(text => console.log(text));

// Get chat history
const history = await agent.getChatHistory('memory-id-123');

// Semantic search across agent's knowledge
const results = await agent.search({ prompt: 'product docs', limit: 10 });

// Provide feedback on responses
await agent.provideFeedback('thumbs_up'); // or 'thumbs_down'

// Observe status updates (for long-running operations)
agent.observeStatusUpdates().subscribe(status => {
  console.log(status.title, status.tags);
});
```

**Agent Security (@secureAiAgent):**

Secure agent access on the backend:

**Backend:**
```typescript
import { SquidService, secureAiAgent } from '@squidcloud/backend';

export class MyService extends SquidService {
  // Secure specific agent
  @secureAiAgent('customer-support-agent')
  allowCustomerAgent(): boolean {
    return this.isAuthenticated();
  }

  // Secure all agents
  @secureAiAgent()
  allowAllAgents(): boolean {
    return this.isAuthenticated();
  }
}
```

**Important Notes:**
- Connected resources can be set on agent creation/update OR per-request
- Per-request settings override agent-level settings
- Agent automatically decides when to use connected resources based on the prompt
- `executionPlanOptions` enables the agent to create a plan before using resources (improves accuracy)
- `chatId` and `profileId` are deprecated - use `memoryOptions` instead

### AI - Knowledge Bases

```typescript
const kb = squid.ai().knowledgeBase('product-docs');

// Upsert context (with or without file)
await kb.upsertContext({
  contextId: 'doc-123',
  text: 'Product documentation...',
  metadata: { category: 'user-guide', version: '2.0' }
}, optionalFile);

// Batch upsert
await kb.upsertContexts([
  { contextId: 'doc-1', text: '...' },
  { contextId: 'doc-2', text: '...' }
], optionalFiles);

// Search with prompt
const results = await kb.searchContextsWithPrompt({
  prompt: 'How do I reset password?',
  limit: 5,
  metadata: { category: 'user-guide' }
});

// Search by context ID
const related = await kb.searchContextsWithContextId({
  contextId: 'doc-123',
  limit: 10
});

// Semantic search (returns chunks)
const searchResults = await kb.search({
  prompt: 'authentication',
  limit: 10
});

// Get context
const context = await kb.getContext('doc-123');

// List contexts
const allContexts = await kb.listContexts(1000); // truncateTextAfter
const contextIds = await kb.listContextIds();

// Download context
const download = await kb.downloadContext('doc-123');

// Delete contexts
await kb.deleteContext('doc-123');
await kb.deleteContexts(['doc-1', 'doc-2']);

// List all knowledge bases
const allKBs = await squid.ai().listKnowledgeBases();
```

### AI - Image & Audio

```typescript
// Image generation
const imageUrl = await squid.ai().image().generate(
  'A futuristic city',
  { size: '1024x1024', quality: 'hd' }
);

// Remove background
const noBgBase64 = await squid.ai().image().removeBackground(imageFile);

// Transcribe audio
const text = await squid.ai().audio().transcribe(audioFile, {
  language: 'en'
});

// Text-to-speech
const audioFile = await squid.ai().audio().createSpeech(
  'Hello world',
  { modelName: 'tts-1', voice: 'alloy', speed: 1.0 }
);
```

### AI - Query & API Call

AI Query allows you to query your database using natural language prompts. Squid's AI converts your prompt into database queries and returns the results.

```typescript
// Natural language database query (basic)
const result = await squid.ai().executeAiQuery(
  'built_in_db',
  'Show me all active users who registered last month'
);

// With options
const result = await squid.ai().executeAiQuery(
  'built_in_db',
  'Show me all active users who registered last month',
  {
    instructions: 'Only query the users collection',
    generateWalkthrough: true, // Get step-by-step explanation
    enableRawResults: true,     // Include raw query results
    selectCollectionsOptions: {
      collectionsToUse: ['users'] // Limit to specific collections
    },
    generateQueryOptions: {
      maxErrorCorrections: 3  // Number of retry attempts
    },
    analyzeResultsOptions: {
      enableCodeInterpreter: true // Enable code execution for result analysis
    }
  }
);

// AI-powered API call
const apiResult = await squid.ai().executeAiApiCall(
  'stripe-api',
  'Create a $50 charge for customer cus_123',
  ['create-charge'], // allowed endpoints
  true // provide explanation
);
```

### Storage

```typescript
const storage = squid.storage(); // built_in_storage
const s3 = squid.storage('aws-s3-integration');

// Upload file
await storage.uploadFile('/documents', file, 3600); // 1 hour expiration

// Get download URL
const url = await storage.getDownloadUrl('/documents/report.pdf', 3600);
console.log(url.url);

// Get file metadata
const metadata = await storage.getFileMetadata('/documents/report.pdf');
console.log(metadata.filename, metadata.size, metadata.lastModified);

// List directory
const contents = await storage.listDirectoryContents('/documents');
console.log(contents.files, contents.directories);

// Delete files
await storage.deleteFile('/documents/report.pdf');
await storage.deleteFiles(['/docs/file1.pdf', '/docs/file2.pdf']);
```

### Queues

```typescript
const queue = squid.queue<Message>('notifications');
const kafkaQueue = squid.queue<Event>('events', 'kafka-integration');

// Produce messages
await queue.produce([
  { type: 'email', to: 'user@example.com' },
  { type: 'sms', to: '+1234567890' }
]);

// Consume messages (observable)
const subscription = queue.consume<Message>().subscribe(message => {
  console.log('Received:', message);
});

// Unsubscribe
subscription.unsubscribe();
```

### Distributed Locks

```typescript
// Acquire and release manually
const lock = await squid.acquireLock('payment-processing');
try {
  await processPayment();
} finally {
  lock.release(); // Note: release() is synchronous
}

// Check if released
console.log(lock.isReleased()); // true after release

// Observe release (RxJS Observable)
const sub = lock.observeRelease().subscribe(() => {
  console.log('Lock was released');
});

// Automatic release with withLock (recommended)
const result = await squid.withLock('payment-processing', async (lock) => {
  // Critical section - only one client can execute at a time
  await processPayment();
  return 'success';
});

// Lock is automatically released even if callback throws
```

**Important notes:**
- Lock is automatically released if WebSocket connection is lost
- If lock is already held by another client, `acquireLock()` will reject
- Use `@secureDistributedLock(mutexName?)` decorator to secure lock access
- Without API key, you must define security rules for locks

### API Integration

```typescript
const api = squid.api();

// HTTP methods
const customer = await api.get<Customer>('stripe-api', 'get-customer', {
  pathParams: { customerId: 'cus_123' },
  queryParams: { expand: 'subscriptions' }
});

const charge = await api.post<Charge, ChargeRequest>(
  'stripe-api',
  'create-charge',
  { amount: 1000, currency: 'usd' },
  { headers: { 'Idempotency-Key': 'unique' } }
);

// Other methods: put, patch, delete
await api.put(integrationId, endpointId, body, options);
await api.patch(integrationId, endpointId, body, options);
await api.delete(integrationId, endpointId, body, options);
```

### Web

```typescript
const web = squid.web();

// AI-powered web search
const results = await web.aiSearch('latest AI developments');
console.log(results.markdownContent);
console.log(results.citations);

// Get URL content (as markdown)
const content = await web.getUrlContent('https://example.com/article');

// URL shortening
const shortUrl = await web.createShortUrl('https://very-long-url.com', 86400);
console.log(shortUrl.url, shortUrl.id);

const shortUrls = await web.createShortUrls(['url1', 'url2'], 86400);

await web.deleteShortUrl(shortUrlId);
await web.deleteShortUrls([id1, id2]);
```

### Schedulers

```typescript
const schedulers = squid.schedulers;

// List all
const all = await schedulers.list();

// Enable/disable
await schedulers.enable('daily-cleanup');
await schedulers.enable(['scheduler-1', 'scheduler-2']);

await schedulers.disable('hourly-sync');
await schedulers.disable(['scheduler-1', 'scheduler-2']);
```

### Observability & Metrics

```typescript
const obs = squid.observability;

// Report metric
await obs.reportMetric({
  name: 'api_request_count',
  value: 1,
  tags: { endpoint: '/users', method: 'GET' },
  timestamp: Date.now()
});

// Query metrics
const metrics = await obs.queryMetrics({
  metricNames: ['api_request_count'],
  startTime: startTimestamp,
  endTime: endTimestamp,
  groupBy: ['endpoint'],
  filters: { method: 'GET' },
  aggregation: 'sum'
});

// Flush pending
await obs.flush();
```

### Jobs

Jobs allow you to track the status of long-running asynchronous operations. Each job has a unique ID that can be used to query its status or wait for completion.

**Important:** Job IDs must be globally unique and kept private. Anyone who knows a job ID can query its status or result.

```typescript
const jobClient = squid.job();

// Get job status (returns AsyncJob with status: 'pending' | 'completed' | 'failed')
const job = await jobClient.getJob<Result>('job-123');
if (job) {
  console.log('Status:', job.status);
  if (job.status === 'completed') {
    console.log('Result:', job.result);
  } else if (job.status === 'failed') {
    console.log('Error:', job.error);
  }
}

// Wait for completion (resolves when job finishes or throws if job fails)
const result = await jobClient.awaitJob<Result>('job-123');
console.log('Job completed with result:', result);
```

### Admin - Integrations

**Important:** Admin methods require initialization with an API key. They cannot be used with user authentication.

```typescript
// Squid must be initialized with apiKey
const squid = new Squid({ appId: 'app-id', region: 'us-east-1.aws', apiKey: 'your-api-key' });

const integrations = squid.admin().integrations();

// List all or by type
const all = await integrations.list();
const databases = await integrations.list('database');

// Get one
const integration = await integrations.get('postgres-db');

// Create/update
await integrations.upsertIntegration({
  integrationId: 'my-postgres',
  type: 'postgres',
  connectionString: 'postgresql://...'
});

// Delete
await integrations.delete('old-integration');
await integrations.deleteMany(['int-1', 'int-2']);
```

### Admin - Secrets

```typescript
const secrets = squid.admin().secrets();

// Get secret
const value = await secrets.get('STRIPE_KEY');

// Get all
const all = await secrets.getAll();

// Create/update
await secrets.upsert('API_KEY', 'secret-value');
await secrets.upsertMany([
  { key: 'KEY1', value: 'val1' },
  { key: 'KEY2', value: 'val2' }
]);

// Delete
await secrets.delete('OLD_KEY');
await secrets.deleteMany(['KEY1', 'KEY2']);

// API Keys
const apiKeys = secrets.apiKeys;
await apiKeys.upsert('my-key');
const key = await apiKeys.get('my-key');
await apiKeys.delete('my-key');
```

## Backend SDK

### SquidService Base Class

All backend services extend `SquidService`:

```typescript
import { SquidService } from '@squidcloud/backend';

export class MyService extends SquidService {
  // Decorated methods
}
```

**Important:** In backend code running on Squid's infrastructure, the Squid client is **already initialized and available** via `this.squid`. You don't need to manually create a new instance or provide configuration parameters - simply use the pre-configured client.

**Available properties:**

```typescript
this.region // 'local' during dev, region in production
this.backendBaseUrl
this.secrets // From Squid Console
this.apiKeys
this.context // RunContext (appId, clientId, sourceIp, headers, openApiContext)
this.squid // Pre-initialized Squid client instance (ready to use)
this.assetsDirectory // Path to public/ folder
```

**Auth methods:**

```typescript
// Get user authentication (JWT token)
this.getUserAuth() // AuthWithBearer | undefined
  // Returns: { type: 'Bearer', userId: string, expiration: number, attributes: Record<string, any>, jwt?: string }

// Get API key authentication
this.getApiKeyAuth() // AuthWithApiKey | undefined
  // Returns: { type: 'ApiKey', apiKey: string }

this.isAuthenticated() // boolean - true if user token OR API key
this.assertIsAuthenticated() // throws if not authenticated
this.assertApiKeyCall() // throws if not API key auth
```

**Helper methods:**

```typescript
// Create webhook response (for @webhook decorated functions)
this.createWebhookResponse(body?, statusCode?, headers?)
// Throws webhook response immediately (interrupts execution)
this.throwWebhookResponse({ body?, statusCode?, headers? })

// Create OpenAPI response (for OpenAPI/tsoa decorated functions)
this.createOpenApiResponse(body?, statusCode?, headers?)
// Throws OpenAPI response immediately (interrupts execution)
this.throwOpenApiResponse({ body?, statusCode?, headers? })

// Convert browser File to SquidFile for OpenAPI file returns
await this.convertToSquidFile(file: File): Promise<SquidFile>

// Publish AI status update to specific client (used in @aiFunction)
await this.publishAiStatusUpdate(update: AiStatusMessage, clientId: ClientId)
```

### Backend Decorators

This section contains backend decorators that don't have corresponding client methods (triggers, schedulers, security rules, etc.).

#### @trigger(options)
Responds to database collection changes.

```typescript
@trigger({ id: 'user-created', collection: 'users', mutationTypes: ['insert'] })
async onUserCreated(request: TriggerRequest<User>): Promise<void> {
  console.log(request.mutationType); // 'insert' | 'update' | 'delete'
  console.log(request.docBefore);
  console.log(request.docAfter);
}
```

#### @scheduler(options)
Schedules periodic execution using cron expressions.

```typescript
import { CronExpression } from '@squidcloud/backend';

// Using cron string directly
@scheduler({ id: 'daily-cleanup', cron: '0 0 * * *' }) // Daily at midnight UTC
async cleanup(): Promise<void> {
  console.log('Running cleanup');
}

// Using predefined CronExpression enum
@scheduler({ id: 'hourly-sync', cron: CronExpression.EVERY_HOUR })
async hourlySync(): Promise<void> {
  console.log('Running hourly sync');
}

@scheduler({ id: 'weekday-morning', cron: CronExpression.MONDAY_TO_FRIDAY_AT_9AM })
async weekdayTask(): Promise<void> {
  console.log('Running weekday morning task');
}

@scheduler({ id: 'frequent', cron: CronExpression.EVERY_5_MINUTES, exclusive: false })
async frequentTask(): Promise<void> {
  // exclusive: false allows concurrent runs
}
```

**Common CronExpression values:**
- `EVERY_SECOND`, `EVERY_5_SECONDS`, `EVERY_10_SECONDS`, `EVERY_30_SECONDS`
- `EVERY_MINUTE`, `EVERY_5_MINUTES`, `EVERY_10_MINUTES`, `EVERY_30_MINUTES`
- `EVERY_HOUR`, `EVERY_2_HOURS`, `EVERY_3_HOURS`, etc.
- `EVERY_DAY_AT_MIDNIGHT`, `EVERY_DAY_AT_NOON`, `EVERY_DAY_AT_1AM`, etc.
- `EVERY_WEEKDAY`, `EVERY_WEEKEND`, `EVERY_WEEK`
- `MONDAY_TO_FRIDAY_AT_9AM`, `MONDAY_TO_FRIDAY_AT_5PM`, etc.
- `EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT`, `EVERY_QUARTER`, `EVERY_YEAR`

#### @secureTopic(topicName, type, integrationId?)
Secures queue topics.

```typescript
@secureTopic('notifications', 'read')
allowRead(): boolean {
  return this.isAuthenticated();
}

@secureTopic('notifications', 'write')
allowWrite(context: TopicWriteContext<any>): boolean {
  return context.messages.length <= 100;
}
```

Types: `'read'`, `'write'`, `'all'`

#### @secureStorage(type, integrationId?)
Secures storage operations.

```typescript
@secureStorage('write')
allowWrite(context: StorageContext): boolean {
  return !context.pathsInBucket.some(p => p.startsWith('/admin'));
}
```

Types: `'read'`, `'write'`, `'update'`, `'insert'`, `'delete'`, `'all'`

#### @secureApi(integrationId, endpointId?)
Secures API integrations.

```typescript
@secureApi('stripe-api', 'create-charge')
allowCharge(context: ApiCallContext): boolean {
  const amount = (context.body as any)?.amount;
  return amount < 10000;
}

@secureApi('external-api') // Secures entire API
allowApi(): boolean {
  return this.isAuthenticated();
}
```

#### @secureNativeQuery(integrationId)
Secures native database queries.

```typescript
@secureNativeQuery('postgres-db')
allowQuery(context: NativeQueryContext): boolean {
  if (context.type === 'relational') {
    return !context.query.toUpperCase().includes('DROP');
  }
  return true;
}
```

#### @secureAiQuery(integrationId?)
Secures AI query execution.

```typescript
@secureAiQuery()
allowAiQuery(context: AiQueryContext): boolean {
  return this.isAuthenticated() && context.prompt.length < 1000;
}
```

#### @secureAiAgent(agentId?)
Secures AI agent access.

```typescript
@secureAiAgent('customer-bot')
allowAgent(context: SecureAiAgentContext): boolean {
  return !context.prompt?.includes('admin');
}

@secureAiAgent() // All agents
allowAllAgents(): boolean {
  return this.isAuthenticated();
}
```

#### @secureDistributedLock(mutexName?)
Secures distributed lock access.

```typescript
// Secure specific mutex
@secureDistributedLock('payment-processing')
allowPaymentLock(context: DistributedLockContext): boolean {
  // context.mutex contains the mutex name
  return this.isAuthenticated() && context.mutex === 'payment-processing';
}

// Secure all mutexes
@secureDistributedLock()
allowAllLocks(context: DistributedLockContext): boolean {
  return this.isAuthenticated();
}
```

**Important:** Without API key, you must define `@secureDistributedLock` decorators to allow lock acquisition.

#### @aiFunction(options)
Exposes function to AI agents. Agents automatically call these functions based on user prompts.

```typescript
// Simple form: description and params array
@aiFunction('Returns the names of the pirates crew on a given ship name', [
  { name: 'shipName', type: 'string', required: true, description: 'The name of the ship' }
])
async getShipCrew({ shipName }: { shipName: string }): Promise<string[]> {
  const crew = await getCrew(shipName);
  return crew.map(m => m.name);
}

// Options object form with more control
@aiFunction({
  id: 'custom-function-id',  // Optional custom ID
  description: 'Get user profile',
  params: [
    { name: 'userId', type: 'string', required: true, description: 'User ID' }
  ],
  attributes: {
    integrationType: ['salesforce']  // Only available when specific integrations connected
  }
})
async getUserProfile(
  params: { userId: string },
  context: AiFunctionCallContext
): Promise<User> {
  console.log('Agent ID:', context.agentId);
  console.log('Integration ID:', context.integrationId);
  return { userId: params.userId, name: 'John' };
}

// Parameter types: 'string' | 'number' | 'boolean' | 'date' | 'files'
@aiFunction('Books a hotel room', [
  { name: 'hotelName', type: 'string', required: true, description: 'Name of hotel' },
  { name: 'checkInDate', type: 'date', required: true, description: 'Check-in date' },
  { name: 'numberOfGuests', type: 'number', required: true, description: 'Number of guests' },
  { name: 'breakfast', type: 'boolean', required: false, description: 'Include breakfast' },
  { name: 'roomType', type: 'string', required: true, description: 'Type of room',
    enum: ['single', 'double', 'suite'] }
])
async bookHotel(args: BookingArgs): Promise<string> {
  return `Booked ${args.roomType} room at ${args.hotelName}`;
}

// Using predefined parameters (hidden from AI)
// Call from client with: agent.ask(prompt, {
//   functions: ['sendEmail'],
//   predefinedParams: { sendEmail: { apiKey: 'secret' } }
// })
@aiFunction('Sends an email', [
  { name: 'recipient', type: 'string', required: true, description: 'Email recipient' },
  { name: 'subject', type: 'string', required: true, description: 'Email subject' },
  { name: 'body', type: 'string', required: true, description: 'Email body' }
])
async sendEmail(args: { recipient: string; subject: string; body: string; apiKey?: string }): Promise<string> {
  await emailService.send(args.apiKey, args.recipient, args.subject, args.body);
  return 'Email sent successfully';
}
```

**Using functions from client:**
```typescript
const response = await agent.ask('What is the crew of the Black Pearl?', {
  functions: ['getShipCrew', 'getShipDetails']  // Function names or custom IDs
});
```

#### @limits(options)
Rate/quota limiting.

```typescript
// Simple rate limit (5 QPS globally)
@limits({ rateLimit: 5 })
async limited(): Promise<void> {}

// Quota (100 calls/month per user)
@limits({ quotaLimit: { value: 100, scope: 'user', renewPeriod: 'monthly' } })
async quotaLimited(): Promise<void> {}

// Multiple limits
@limits({
  rateLimit: [
    { value: 100, scope: 'global' },
    { value: 10, scope: 'user' }
  ],
  quotaLimit: [
    { value: 10000, scope: 'global', renewPeriod: 'monthly' },
    { value: 500, scope: 'user', renewPeriod: 'weekly' }
  ]
})
async multiLimited(): Promise<void> {}
```

Scopes: `'global'`, `'user'`, `'ip'`
Periods: `'hourly'`, `'daily'`, `'weekly'`, `'monthly'`, `'quarterly'`, `'annually'`

## Common Patterns

### Authentication

Client:
```typescript
const squid = new Squid({
  appId: 'YOUR_APP_ID',
  region: 'us-east-1.aws',
  authProvider: {
    integrationId: 'auth0',
    getToken: async () => await auth0.getAccessTokenSilently()
  }
});
```

Backend:

```typescript
@executable()
async getUserData(): Promise<UserData> {
  this.assertIsAuthenticated();
  const userId = this.getUserAuth()?.userId;
  if (!userId) throw new Error('User not authenticated');
  return await fetchUserData(userId);
}

@secureCollection('users', 'read')
allowRead(context: QueryContext): boolean {
  const userId = this.getUserAuth()?.userId;
  if (!userId) return false;
  return context.isSubqueryOf('id', '==', userId);
}
```

### File Upload

Client:
```typescript
const file: File = ...; // from input
await squid.storage().uploadFile('/uploads', file);
// OR
await squid.executeFunction('processFile', file);
```

Backend:
```typescript
@executable()
async processFile(file: SquidFile): Promise<Result> {
  console.log(file.originalName, file.size, file.mimetype);
  const content = new TextDecoder().decode(file.data);
  return { processed: true };
}
```

### Using Squid Client in Backend

```typescript
export class MyService extends SquidService {
  @executable()
  async aggregateStats(userId: string): Promise<Stats> {
    const orders = await this.squid.collection('orders')
      .query()
      .eq('userId', userId)
      .snapshot();

    return { totalOrders: orders.data.length };
  }
}
```

## Best Practices

1. **Always secure collections/topics/storage** - Default deny
2. **Validate input in executables** - Check auth and params
3. **Use transactions for multi-doc updates** - Atomic operations
4. **Limit query results** - Default 1000, max 20000
5. **Use snapshots for one-time data** - Use subscriptions for realtime
6. **Batch operations when possible** - insertMany, deleteMany
7. **Use memoryOptions for AI conversations** - Not deprecated chatId
8. **Test in dev before prod deployment** - `squid deploy --environmentId dev`

## Documentation

- Docs: https://docs.getsquid.ai/
- Console: https://console.getsquid.ai/
- Samples: https://github.com/squid-cloud-samples

---

**This skill is verified against the actual Squid source code and contains only accurate, tested APIs.**
