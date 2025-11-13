/**
 * Executable test script for the Matching Service
 * Run this to test the matching service with realistic data
 */

import { TEST_DATA } from './service/matching-service.test';

async function main() {
  console.log('='.repeat(80));
  console.log('MATCHING SERVICE TEST RUNNER');
  console.log('='.repeat(80));

  const { COMPANY_PROFILE, TEST_PROJECTS } = TEST_DATA;

  console.log('\n📋 Company Profile:');
  console.log('-'.repeat(80));
  console.log(COMPANY_PROFILE.trim());

  console.log('\n\n📂 Test Projects (' + TEST_PROJECTS.length + ' total):');
  console.log('-'.repeat(80));

  TEST_PROJECTS.forEach((project, index) => {
    const lines = project.description.trim().split('\n');
    const title = lines[0] || `Project ${index + 1}`;
    console.log(`\n${index + 1}. [${project.id}] ${title}`);
    console.log(`   ${lines[1]?.trim() || 'No description'}`);
  });

  console.log('\n\n' + '='.repeat(80));
  console.log('🚀 HOW TO TEST:');
  console.log('='.repeat(80));

  console.log('\nOption 1: Test via Squid Console UI');
  console.log('  1. Go to https://console.getsquid.ai/');
  console.log('  2. Navigate to your app (rfz4m5p7nsqkan4818)');
  console.log('  3. Go to "Backend" → "Functions"');
  console.log('  4. Find "MatchingService.matchProjects"');
  console.log('  5. Use the test data below as parameters');

  console.log('\n\nOption 2: Test via Frontend Code');
  console.log('  Use this code in your React app:');
  console.log(`
  import { useSquid } from '@squidcloud/react';

  function TestMatching() {
    const squid = useSquid();

    const runTest = async () => {
      const companyProfile = \`${COMPANY_PROFILE.trim().substring(0, 100)}...\`;

      const projects = ${JSON.stringify(TEST_PROJECTS.slice(0, 2), null, 2)};

      try {
        const matchingService = squid.service('matching-service');
        const results = await matchingService.executeFunction(
          'matchProjects',
          companyProfile,
          projects,
          'matching-agent',
          60
        );

        console.log('Matching Results:', results);
        results.forEach(result => {
          console.log(\`Project \${result.id}: \${result.score}% match\`);
          console.log(\`  Good Fit: \${result.isGoodFit}\`);
          console.log(\`  Reasoning: \${result.reasoning}\`);
        });
      } catch (error) {
        console.error('Error:', error);
      }
    };

    return <button onClick={runTest}>Run Matching Test</button>;
  }
  `);

  console.log('\n\nOption 3: Test via Squid CLI');
  console.log('  You can also test locally with squid start:');
  console.log('  1. Run: npm run start');
  console.log('  2. The backend will run locally');
  console.log('  3. Call the function from your frontend');

  console.log('\n\n' + '='.repeat(80));
  console.log('📊 EXPECTED RESULTS:');
  console.log('='.repeat(80));

  const expectations = [
    { id: 'proj-001', score: '85-95%', fit: 'YES', reason: 'Perfect tech stack match' },
    { id: 'proj-002', score: '20-35%', fit: 'NO', reason: 'Requires native iOS, not React Native' },
    { id: 'proj-003', score: '90-98%', fit: 'YES', reason: 'Excellent match with healthcare experience' },
    { id: 'proj-004', score: '85-95%', fit: 'YES', reason: 'Strong AI/chatbot capabilities' },
    { id: 'proj-005', score: '15-30%', fit: 'NO', reason: 'No blockchain experience' },
    { id: 'proj-006', score: '88-96%', fit: 'YES', reason: 'Perfect for real-time collaboration' },
    { id: 'proj-007', score: '45-60%', fit: 'MAYBE', reason: 'Basic ML, not core expertise' },
    { id: 'proj-008', score: '10-25%', fit: 'NO', reason: 'Too small, different tech stack' },
  ];

  console.log('\n');
  expectations.forEach(exp => {
    console.log(`${exp.id}: ${exp.score} → ${exp.fit}`);
    console.log(`  ${exp.reason}\n`);
  });

  console.log('='.repeat(80));
  console.log('\n✅ Test data is ready!');
  console.log('⚠️  Remember to create the "matching-agent" in Squid Console first!\n');

  // Export JSON for easy copy-paste
  console.log('\n📋 COPY-PASTE JSON TEST DATA:');
  console.log('='.repeat(80));
  console.log('\nCompany Profile (paste as string parameter):');
  console.log(JSON.stringify(COMPANY_PROFILE, null, 2));

  console.log('\n\nProjects Array (paste as array parameter):');
  console.log(JSON.stringify(TEST_PROJECTS.slice(0, 3), null, 2));

  console.log('\n' + '='.repeat(80));
}

// Run the test
main().catch(console.error);
