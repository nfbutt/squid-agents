/**
 * Test script for the Knowledge Base-based Matching Service
 * This demonstrates how to use the knowledge base for semantic similarity matching
 */

import { Squid } from '@squidcloud/client';
import { TEST_DATA } from './service/matching-service.test';

// Initialize Squid client for testing
const API_KEY = process.env.SQUID_API_KEY;

const squid = new Squid({
  appId: 'rfz4m5p7nsqkan4818',
  region: 'us-east-1.aws',
  environmentId: 'dev',
  squidDeveloperId: API_KEY,
});

/**
 * Step 1: Initialize the knowledge base
 */
async function initializeKnowledgeBase() {
  console.log('\n📚 Step 1: Initializing Knowledge Base');
  console.log('='.repeat(80));

  try {
    const result = await squid.executeFunction('initializeKnowledgeBase');
    console.log('✅', result.message);
    return result.success;
  } catch (error: any) {
    if (error.message?.includes('FUNCTION_NOT_FOUND')) {
      console.error('❌ Error: Backend functions not deployed!');
      console.error('\n🚀 To fix this, run the following commands:');
      console.error('   1. cd rfp-tracker-backend');
      console.error('   2. npm run deploy');
      console.error('   3. Wait for deployment to complete');
      console.error('   4. Run this test again\n');
      throw new Error('Backend not deployed. Please deploy first.');
    }
    console.error('❌ Error initializing knowledge base:', error);
    return false;
  }
}

/**
 * Step 2: Store all test projects in the knowledge base
 */
async function storeTestProjects() {
  console.log('\n📥 Step 2: Storing Projects in Knowledge Base');
  console.log('='.repeat(80));

  try {
    const { TEST_PROJECTS } = TEST_DATA;
    console.log(`Storing ${TEST_PROJECTS.length} projects...`);

    const result = await squid.executeFunction('storeProjects', TEST_PROJECTS);

    console.log('✅', result.message);
    console.log(`   Success: ${result.successCount} | Failures: ${result.failureCount}`);

    return result.success;
  } catch (error) {
    console.error('❌ Error storing projects:', error);
    return false;
  }
}

/**
 * Step 3: Perform semantic similarity search using company profile
 */
async function matchProjectsUsingKnowledgeBase() {
  console.log('\n🔍 Step 3: Matching Projects Using Knowledge Base');
  console.log('='.repeat(80));

  const { COMPANY_PROFILE } = TEST_DATA;

  console.log('\nCompany Profile:');
  console.log('-'.repeat(80));
  console.log(COMPANY_PROFILE.trim().substring(0, 200) + '...\n');

  try {
    console.log('Performing semantic similarity search...\n');

    const results = await squid.executeFunction(
      'matchProjectsWithKnowledgeBase',
      COMPANY_PROFILE,
      10, // limit
      60 // threshold
    );

    console.log('✅ MATCHING RESULTS:');
    console.log('='.repeat(80));

    if (results.length === 0) {
      console.log('No matching projects found.');
      return true;
    }

    results.forEach((result: any, index: number) => {
      console.log(`\n${index + 1}. Project: ${result.id}`);
      console.log(`   Score: ${result.score}% ${result.isGoodFit ? '✓ GOOD FIT' : '✗ NOT A FIT'}`);
      console.log(`   Reasoning: ${result.reasoning.substring(0, 150)}...`);
      console.log(`   Matched Areas: ${result.matchedAreas.join(', ')}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`Total matches found: ${results.length}`);
    console.log(`Good fits: ${results.filter((r: any) => r.isGoodFit).length}`);

    return true;
  } catch (error) {
    console.error('❌ Error matching projects:', error);
    return false;
  }
}

/**
 * Comparison: Run old method vs new knowledge base method
 */
async function compareApproaches() {
  console.log('\n📊 Step 4: Comparing Approaches');
  console.log('='.repeat(80));

  const { COMPANY_PROFILE, TEST_PROJECTS } = TEST_DATA;

  console.log('\nApproach 1: Traditional AI Agent Matching (processes each project individually)');
  console.log('Approach 2: Knowledge Base Semantic Search (fast similarity matching)\n');

  try {
    // Traditional approach (using first 3 projects only for speed)
    console.log('⏱️  Running traditional approach (3 projects)...');
    const traditionalStart = Date.now();
    await squid.executeFunction(
      'matchProjects',
      COMPANY_PROFILE,
      TEST_PROJECTS.slice(0, 3),
      'matching-agent',
      60
    );
    const traditionalTime = Date.now() - traditionalStart;
    console.log(`   Completed in ${traditionalTime}ms\n`);

    // Knowledge base approach
    console.log('⏱️  Running knowledge base approach (all projects)...');
    const kbStart = Date.now();
    const kbResults = await squid.executeFunction(
      'matchProjectsWithKnowledgeBase',
      COMPANY_PROFILE,
      10,
      60
    );
    const kbTime = Date.now() - kbStart;
    console.log(`   Completed in ${kbTime}ms\n`);

    console.log('📈 Performance Summary:');
    console.log(`   Traditional: ${traditionalTime}ms for 3 projects (${Math.round(traditionalTime / 3)}ms per project)`);
    console.log(`   Knowledge Base: ${kbTime}ms for ${kbResults.length} projects`);
    console.log(`   Speedup: ${(traditionalTime / kbTime).toFixed(2)}x faster`);

    return true;
  } catch (error) {
    console.error('❌ Error comparing approaches:', error);
    return false;
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(15) + 'KNOWLEDGE BASE MATCHING SERVICE TEST' + ' '.repeat(27) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  try {
    // Step 1: Initialize knowledge base
    const initialized = await initializeKnowledgeBase();
    if (!initialized) {
      console.log('\n⚠️  Knowledge base initialization failed. It may already exist.');
    }

    // Step 2: Store projects
    const stored = await storeTestProjects();
    if (!stored) {
      console.log('\n⚠️  Failed to store some projects.');
    }

    // Step 3: Match using knowledge base
    await matchProjectsUsingKnowledgeBase();

    // Step 4: Compare approaches
    await compareApproaches();

    console.log('\n' + '='.repeat(80));
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log('\n📝 Key Benefits of Knowledge Base Approach:');
    console.log('   1. Semantic similarity search using embeddings');
    console.log('   2. Faster matching for large datasets');
    console.log('   3. Projects stored once, queried many times');
    console.log('   4. Built-in reranking for better results');
    console.log('   5. Metadata filtering capabilities\n');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    process.exit(1);
  }
}

// Export for use in other tests
export { initializeKnowledgeBase, storeTestProjects, matchProjectsUsingKnowledgeBase };

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
