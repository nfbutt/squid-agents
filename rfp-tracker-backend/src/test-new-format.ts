/**
 * Test script to demonstrate the new matchProjectsWithKnowledgeBase format
 * Tests both basic usage and filter parameters
 */

import { Squid } from '@squidcloud/client';

const API_KEY = process.env.SQUID_API_KEY;

const squid = new Squid({
  appId: 'rfz4m5p7nsqkan4818',
  region: 'us-east-1.aws',
  environmentId: 'dev',
  squidDeveloperId: API_KEY,
});

const COMPANY_PROFILE = `
TechFlow Solutions is a full-stack software development company with 8 years of experience.
We specialize in:
- Frontend: React, Next.js, TypeScript, Vue.js, responsive web design
- Backend: Node.js, Express, Python, Django, RESTful APIs, GraphQL
- Cloud: AWS (EC2, S3, Lambda, RDS), Docker, Kubernetes
- Database: PostgreSQL, MongoDB, Redis
- Mobile: React Native, iOS and Android development
- DevOps: CI/CD pipelines, GitHub Actions, Jenkins
- AI/ML: Basic integration with OpenAI, chatbots, recommendation systems
`;

async function testBasicUsage() {
  console.log('='.repeat(80));
  console.log('TEST 1: BASIC USAGE (No Filters)');
  console.log('='.repeat(80));

  try {
    console.log('\nCalling matchProjectsWithKnowledgeBase without filters...\n');

    const result = await squid.executeFunction(
      'matchProjectsWithKnowledgeBase',
      COMPANY_PROFILE,
      10, // limit
      60  // threshold
    );

    console.log('✅ Response received!\n');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testWithNAICSFilter() {
  console.log('\n\n' + '='.repeat(80));
  console.log('TEST 2: WITH NAICS CODE FILTER');
  console.log('='.repeat(80));

  try {
    console.log('\nFiltering by NAICS codes: 541511, 541512\n');

    const result = await squid.executeFunction(
      'matchProjectsWithKnowledgeBase',
      COMPANY_PROFILE,
      10,                    // limit
      60,                    // threshold
      ['541511', '541512']   // naicsCodes filter
    );

    console.log('✅ Response received!\n');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testWithKeywordsFilter() {
  console.log('\n\n' + '='.repeat(80));
  console.log('TEST 3: WITH KEYWORDS FILTER');
  console.log('='.repeat(80));

  try {
    console.log('\nFiltering by keywords: React, Node.js, AI\n');

    const result = await squid.executeFunction(
      'matchProjectsWithKnowledgeBase',
      COMPANY_PROFILE,
      10,                          // limit
      60,                          // threshold
      undefined,                   // no NAICS filter
      ['React', 'Node.js', 'AI']   // keywords filter
    );

    console.log('✅ Response received!\n');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function testWithAllFilters() {
  console.log('\n\n' + '='.repeat(80));
  console.log('TEST 4: WITH ALL FILTERS COMBINED');
  console.log('='.repeat(80));

  try {
    console.log('\nUsing all filters:');
    console.log('  - NAICS: 541511');
    console.log('  - Keywords: Healthcare, React');
    console.log('  - Solicitations: SOL-2024-003\n');

    const result = await squid.executeFunction(
      'matchProjectsWithKnowledgeBase',
      COMPANY_PROFILE,
      10,                           // limit
      60,                           // threshold
      ['541511'],                   // naicsCodes filter
      ['Healthcare', 'React'],      // keywords filter
      ['SOL-2024-003']              // solicitations filter
    );

    console.log('✅ Response received!\n');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function runAllTests() {
  console.log('\n');
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(15) + 'matchProjectsWithKnowledgeBase TESTS' + ' '.repeat(27) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  console.log('\n');

  // Run all test cases
  await testBasicUsage();
  await testWithNAICSFilter();
  await testWithKeywordsFilter();
  await testWithAllFilters();

  console.log('\n\n' + '='.repeat(80));
  console.log('EXPECTED RESPONSE FORMAT:');
  console.log('='.repeat(80));
  console.log(`
{
  "results": [
    {
      "id": "proj-001",
      "status": "relevant",
      "reasoning": "This solicitation matches your company's IT services capabilities...",
      "confidence": 0.85
    },
    {
      "id": "proj-002",
      "status": "irrelevant",
      "reasoning": "This opportunity requires construction experience which doesn't match...",
      "confidence": 0.35
    }
  ]
}
  `);

  console.log('='.repeat(80));
  console.log('\n✅ All tests completed!\n');
}

// Run all tests
runAllTests();
