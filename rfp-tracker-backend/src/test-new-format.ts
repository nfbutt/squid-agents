/**
 * Test script to demonstrate the new matchProjectsWithKnowledgeBase format
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

async function testNewFormat() {
  console.log('='.repeat(80));
  console.log('TESTING NEW matchProjectsWithKnowledgeBase FORMAT');
  console.log('='.repeat(80));

  try {
    console.log('\nCalling matchProjectsWithKnowledgeBase...\n');

    const result = await squid.executeFunction(
      'matchProjectsWithKnowledgeBase',
      COMPANY_PROFILE,
      10, // limit
      60  // threshold
    );

    console.log('✅ Response received!\n');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n' + '='.repeat(80));
    console.log('EXPECTED FORMAT:');
    console.log('='.repeat(80));
    console.log(`
{
  "results": [
    {
      "id": "uuid-of-solicitation-1",
      "status": "relevant",
      "reasoning": "This solicitation matches your company's IT services capabilities...",
      "confidence": 0.85
    },
    {
      "id": "uuid-of-solicitation-2",
      "status": "irrelevant",
      "reasoning": "This opportunity requires construction experience which doesn't match your profile...",
      "confidence": 0.92
    }
  ]
}
    `);

    console.log('='.repeat(80));
    console.log('\n✅ Test completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testNewFormat();
