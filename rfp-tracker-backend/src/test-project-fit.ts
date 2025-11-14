/**
 * Test script for the isProjectGoodFitByKnowledgeBase function
 * This demonstrates how to check if a new project is a good fit for a company
 * by analyzing similar projects in the knowledge base
 */

import { Squid } from '@squidcloud/client';
import { TEST_DATA } from './service/matching-service.test';

// Initialize Squid client
const API_KEY = process.env.SQUID_API_KEY;

const squid = new Squid({
  appId: 'rfz4m5p7nsqkan4818',
  region: 'us-east-1.aws',
  environmentId: 'dev',
  squidDeveloperId: API_KEY,
});

/**
 * Test project fit analysis
 */
async function testProjectFitAnalysis() {
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + 'PROJECT FIT ANALYSIS TEST' + ' '.repeat(33) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  const { COMPANY_PROFILE } = TEST_DATA;

  // Test Case 1: New React E-commerce Project (should be a good fit)
  const reactEcommerceProject = `
    Project: Modern E-commerce Platform with React
    We need a team to build a comprehensive e-commerce solution.
    Requirements:
    - React 18 with Next.js 14
    - TypeScript for type safety
    - Node.js backend with Express
    - PostgreSQL database
    - AWS deployment (EC2, S3, CloudFront)
    - Stripe payment integration
    - Real-time inventory management
    - Admin dashboard with analytics
    - Mobile-responsive design
    Timeline: 5 months
    Budget: $90,000
  `;

  // Test Case 2: Blockchain DeFi Platform (should NOT be a good fit)
  const blockchainProject = `
    Project: DeFi Yield Farming Platform
    Seeking blockchain developers for a decentralized finance platform.
    Requirements:
    - Solidity smart contracts
    - Ethereum and Polygon integration
    - Web3.js and ethers.js
    - Liquidity pool management
    - Yield farming algorithms
    - Security audits
    - Gas optimization
    - DApp frontend with React
    Timeline: 6 months
    Budget: $150,000
  `;

  // Test Case 3: Healthcare Portal (should be a good fit)
  const healthcareProject = `
    Project: Patient Portal for Medical Practice
    Building a secure patient management system.
    Requirements:
    - React with TypeScript
    - Node.js/Express backend
    - PostgreSQL database
    - HIPAA compliance
    - Appointment scheduling
    - Medical records management
    - Video consultation integration
    - AWS hosting with encryption
    Timeline: 6 months
    Budget: $110,000
  `;

  console.log('\n📋 Company Profile:');
  console.log('-'.repeat(80));
  console.log(COMPANY_PROFILE.trim().substring(0, 300) + '...\n');

  // Test each project
  const testCases = [
    { name: 'React E-commerce Platform', description: reactEcommerceProject, expectedFit: true },
    { name: 'Blockchain DeFi Platform', description: blockchainProject, expectedFit: false },
    { name: 'Healthcare Patient Portal', description: healthcareProject, expectedFit: true },
  ];

  for (const testCase of testCases) {
    console.log('\n' + '='.repeat(80));
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log('='.repeat(80));

    try {
      const result = await squid.executeFunction(
        'isProjectGoodFitByKnowledgeBase',
        testCase.description,
        COMPANY_PROFILE,
        70, // similarityThreshold
        60, // fitThreshold
        10 // limitSimilar
      );

      console.log('\n📊 ANALYSIS RESULT:');
      console.log(`   Is Good Fit: ${result.isGoodFit ? '✅ YES' : '❌ NO'}`);
      console.log(`   Confidence: ${result.confidence}%`);
      console.log(`\n   Reasoning: ${result.reasoning}`);

      console.log('\n📈 Statistics:');
      console.log(`   Similar Projects Analyzed: ${result.statistics.totalSimilarProjects}`);
      console.log(`   Good Fit Projects: ${result.statistics.goodFitProjects}`);
      console.log(`   Good Fit Percentage: ${result.statistics.goodFitPercentage}%`);
      console.log(`   Average Fit Score: ${result.statistics.averageFitScore}/100`);

      if (result.similarProjects.length > 0) {
        console.log('\n🔗 Similar Projects:');
        result.similarProjects.forEach((proj, idx) => {
          console.log(
            `   ${idx + 1}. ${proj.id} - Similarity: ${proj.similarity}%, Company Fit: ${proj.companyFitScore}% ${proj.isCompanyFit ? '✓' : '✗'}`
          );
        });
      }

      // Validation
      const matchesExpectation = result.isGoodFit === testCase.expectedFit;
      console.log(
        `\n${matchesExpectation ? '✅' : '⚠️'} Expected: ${testCase.expectedFit ? 'Good Fit' : 'Not a Good Fit'} | Got: ${result.isGoodFit ? 'Good Fit' : 'Not a Good Fit'}`
      );
    } catch (error: any) {
      if (error.message?.includes('FUNCTION_NOT_FOUND')) {
        console.error('\n❌ Error: Backend functions not deployed!');
        console.error('Please run: npm run deploy');
        throw error;
      }
      console.error('\n❌ Error analyzing project:', error.message);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ PROJECT FIT ANALYSIS TEST COMPLETED');
  console.log('='.repeat(80));
}

/**
 * Test with a custom project
 */
async function testCustomProject(
  projectDescription: string,
  companyProfile: string
): Promise<void> {
  console.log('\n🎯 CUSTOM PROJECT ANALYSIS');
  console.log('='.repeat(80));

  try {
    const result = await squid.executeFunction(
      'isProjectGoodFitByKnowledgeBase',
      projectDescription,
      companyProfile,
      70,
      60,
      10
    );

    console.log(`\n${result.isGoodFit ? '✅ GOOD FIT' : '❌ NOT A GOOD FIT'}`);
    console.log(`Confidence: ${result.confidence}%`);
    console.log(`\n${result.reasoning}`);
    console.log(
      `\nBased on ${result.statistics.totalSimilarProjects} similar projects with ${result.statistics.goodFitPercentage}% good fit rate.`
    );

    return;
  } catch (error: any) {
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Main test runner
 */
async function main() {
  try {
    // Run the standard tests
    await testProjectFitAnalysis();

    console.log('\n\n💡 HOW IT WORKS:');
    console.log('='.repeat(80));
    console.log('1. Finds similar projects in the knowledge base using semantic search');
    console.log('2. Checks how well each similar project fits the company profile');
    console.log('3. If 50%+ of similar projects are a good fit, the new project is recommended');
    console.log('4. Provides confidence score based on the percentage of good fits');
    console.log('\n📝 Use Case:');
    console.log('   When evaluating a new RFP/project opportunity, this function helps');
    console.log('   determine if it aligns with your company\'s strengths based on');
    console.log('   historical project similarity analysis.\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Export for use in other tests
export { testProjectFitAnalysis, testCustomProject };

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
