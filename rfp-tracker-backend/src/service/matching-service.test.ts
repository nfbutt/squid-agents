import { MatchingService, ProjectTuple } from './matching-service';

import { Squid } from '@squidcloud/client';

// Initialize Squid client for testing
// Get API key from environment variable or pass it directly
const API_KEY = process.env.SQUID_API_KEY;

const squid = new Squid({
  appId: 'rfz4m5p7nsqkan4818',
  region: 'us-east-1.aws',
  environmentId: 'dev',
  squidDeveloperId: API_KEY,
});




/**
 * Test data for matching service
 */

// Sample company profile
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

Our team consists of 15 developers, 3 designers, and 2 QA engineers.
We have successfully delivered 50+ projects across various industries including:
- E-commerce platforms
- Healthcare management systems
- Financial dashboards
- Educational technology
- Real-time collaboration tools

We follow agile methodologies and prioritize clean code, testing, and documentation.
`;

// Sample projects with varying match levels
const TEST_PROJECTS: ProjectTuple[] = [
  {
    id: 'proj-001',
    description: `
    Project: E-commerce Platform Redesign
    We need a team to redesign and rebuild our e-commerce platform using modern technologies.
    Requirements:
    - React or Next.js for frontend
    - Node.js backend with RESTful APIs
    - PostgreSQL database
    - AWS hosting
    - Mobile-responsive design
    - Payment gateway integration
    - Admin dashboard for inventory management
    Timeline: 4 months
    Budget: $80,000
    `,
  },
  {
    id: 'proj-002',
    description: `
    Project: iOS Native App for Fitness Tracking
    Looking for experienced iOS developers to build a native fitness tracking app.
    Requirements:
    - Swift and SwiftUI
    - HealthKit integration
    - Apple Watch companion app
    - CoreML for activity recognition
    - Backend in Firebase
    - Social features and leaderboards
    Timeline: 3 months
    Budget: $60,000
    `,
  },
  {
    id: 'proj-003',
    description: `
    Project: Healthcare Patient Portal
    Building a HIPAA-compliant patient portal for a medical practice.
    Requirements:
    - React frontend with TypeScript
    - Node.js/Express backend
    - PostgreSQL database
    - Secure authentication and authorization
    - Appointment scheduling
    - Medical records management
    - Telemedicine video integration
    - AWS hosting with encryption
    Timeline: 6 months
    Budget: $120,000
    `,
  },
  {
    id: 'proj-004',
    description: `
    Project: AI-Powered Chatbot for Customer Support
    Need to develop an intelligent chatbot for our customer support.
    Requirements:
    - Integration with OpenAI GPT models
    - Natural language processing
    - React frontend widget
    - Node.js backend
    - Integration with existing CRM (Salesforce)
    - Analytics dashboard
    - Multi-language support
    Timeline: 2 months
    Budget: $45,000
    `,
  },
  {
    id: 'proj-005',
    description: `
    Project: Blockchain DApp Development
    Seeking experts to build a decentralized application on Ethereum.
    Requirements:
    - Solidity smart contracts
    - Web3.js integration
    - MetaMask wallet connection
    - IPFS for decentralized storage
    - React frontend
    - Testing with Hardhat/Truffle
    - Gas optimization
    Timeline: 5 months
    Budget: $100,000
    `,
  },
  {
    id: 'proj-006',
    description: `
    Project: Real-time Collaboration Tool
    Building a Slack-like collaboration platform for enterprise use.
    Requirements:
    - React with TypeScript
    - Node.js backend with WebSocket support
    - Real-time messaging
    - File sharing and storage (AWS S3)
    - Video/audio calling
    - MongoDB for message storage
    - Redis for caching
    - Microservices architecture
    Timeline: 8 months
    Budget: $150,000
    `,
  },
  {
    id: 'proj-007',
    description: `
    Project: Machine Learning Model Development
    Need data scientists to develop predictive models for sales forecasting.
    Requirements:
    - Python with TensorFlow/PyTorch
    - Experience with time series analysis
    - Data preprocessing and feature engineering
    - Model training and optimization
    - MLOps setup
    - Jupyter notebooks for documentation
    - API deployment using FastAPI
    Timeline: 4 months
    Budget: $70,000
    `,
  },
  {
    id: 'proj-008',
    description: `
    Project: WordPress Blog Migration
    Simple project to migrate an existing WordPress blog to a new host.
    Requirements:
    - WordPress experience
    - Database migration
    - DNS configuration
    - Plugin setup
    - Basic theme customization
    Timeline: 1 week
    Budget: $2,000
    `,
  },
];

/**
 * Test runner for the matching service
 * NOTE: This requires the AI agent to be configured in Squid Console
 */
export async function runMatchingServiceTest() {
  console.log('='.repeat(80));
  console.log('MATCHING SERVICE TEST');
  console.log('='.repeat(80));
  console.log('\nCompany Profile:');
  console.log(COMPANY_PROFILE.trim());
  console.log('\n' + '='.repeat(80));

  try {
    console.log('\nProcessing projects...');
    console.log(`Total projects to match: ${TEST_PROJECTS.length}\n`);

    // Call the service using the Squid client
    console.log('Calling matchProjects function via Squid client...');
    const results = await squid.executeFunction(
      'matchProjects',
      COMPANY_PROFILE,
      TEST_PROJECTS,
      'matching-agent',
      60
    );

    console.log('\n✅ MATCHING RESULTS RECEIVED:');
    console.log('='.repeat(80));
    results.forEach((result: any) => {
      console.log(`\n${result.id}: ${result.score}% - ${result.isGoodFit ? '✓ GOOD FIT' : '✗ NOT A FIT'}`);
      console.log(`Reasoning: ${result.reasoning}`);
      console.log(`Matched Areas: ${result.matchedAreas.join(', ')}`);
    });

    // Expected results analysis:
    const expectedResults = {
      'proj-001': {
        expected: 'HIGH',
        reason: 'Perfect match - React, Node.js, PostgreSQL, AWS, e-commerce experience',
      },
      'proj-002': {
        expected: 'LOW',
        reason: 'Poor match - requires native iOS/Swift, company focuses on React Native',
      },
      'proj-003': {
        expected: 'HIGH',
        reason: 'Excellent match - React, Node.js, PostgreSQL, AWS, healthcare experience',
      },
      'proj-004': {
        expected: 'HIGH',
        reason: 'Great match - OpenAI integration experience, React, Node.js, chatbot capability',
      },
      'proj-005': {
        expected: 'LOW',
        reason: 'Poor match - no blockchain/Solidity experience mentioned in profile',
      },
      'proj-006': {
        expected: 'HIGH',
        reason: 'Strong match - React/TypeScript, Node.js, MongoDB, Redis, real-time experience',
      },
      'proj-007': {
        expected: 'MEDIUM',
        reason: 'Moderate match - basic ML/AI mentioned, but not core expertise with TensorFlow',
      },
      'proj-008': {
        expected: 'LOW',
        reason: 'Poor match - WordPress not mentioned, small project below company scale',
      },
    };

    console.log('EXPECTED MATCHING RESULTS:');
    console.log('='.repeat(80));

    TEST_PROJECTS.forEach((project) => {
      const expected = expectedResults[project.id as keyof typeof expectedResults];
      console.log(`\n${project.id}: ${expected.expected} MATCH`);
      console.log(`Project: ${project.description.split('\n')[1].trim()}`);
      console.log(`Reason: ${expected.reason}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('\nTo run this test with live AI matching:');
    console.log('1. Ensure you have created the "matching-agent" in Squid Console');
    console.log('2. Deploy the service: npm run deploy');
    console.log('3. Call the matchProjects function from your frontend or Squid Console');
    console.log('='.repeat(80));

    return {
      companyProfile: COMPANY_PROFILE,
      projects: TEST_PROJECTS,
      expectedResults,
    };
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

// Export test data for use in other tests
export const TEST_DATA = {
  COMPANY_PROFILE,
  TEST_PROJECTS,
};

// Uncomment to run test directly
runMatchingServiceTest();
