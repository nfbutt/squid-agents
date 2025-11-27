/**
 * Test script for adding random projects to the Squid Knowledge Base
 * This TypeScript script uses the Squid SDK to connect and add dummy project data
 */

import { Squid } from '@squidcloud/client';

// Get API key from environment or use default
const API_KEY = process.env.SQUID_API_KEY || 'da0ddf58-2373-44b4-a609-73cd3defddf1';

// Initialize Squid client
// Note: Using apiKey for server-side admin access (bypasses security rules)
const squid = new Squid({
  appId: 'rfz4m5p7nsqkan4818',
  region: 'us-east-1.aws',
  environmentId: 'dev',
  apiKey: API_KEY, // Use apiKey for server-side access, not squidDeveloperId
});

// Sample data for generating random projects
const AGENCIES = [
  'Department of Defense',
  'Department of Veterans Affairs',
  'Department of Treasury',
  'Department of Homeland Security',
  'National Park Service',
  'Department of Energy',
  'NASA',
  'Department of Transportation',
  'Department of Commerce',
  'Environmental Protection Agency',
  'Department of Education',
  'Department of Justice',
];

const TECH_STACKS = [
  'React, Node.js, PostgreSQL, AWS',
  'Python, Django, MongoDB, Azure',
  'Angular, .NET, SQL Server, AWS',
  'Vue.js, Express, MySQL, GCP',
  'React Native, Firebase, GraphQL',
  'Python, FastAPI, Redis, Kubernetes',
  'TypeScript, NestJS, PostgreSQL, Docker',
  'Java, Spring Boot, Oracle, AWS',
  'Flutter, Node.js, DynamoDB, Lambda',
  'Svelte, Go, CockroachDB, Terraform',
  'Next.js, Prisma, PostgreSQL, Vercel',
  'Ruby on Rails, PostgreSQL, Heroku',
];

const PROJECT_TYPES = [
  'Cloud Infrastructure Modernization',
  'Mobile Application Development',
  'Data Analytics Platform',
  'Cybersecurity Assessment',
  'AI/ML Implementation',
  'Web Portal Development',
  'Legacy System Migration',
  'IoT Solution Development',
  'Blockchain Integration',
  'DevOps Pipeline Setup',
  'Microservices Architecture',
  'API Gateway Implementation',
];

const NAICS_CODES = ['541511', '541512', '541513', '541519', '541611', '541618', '541690'];

const STATUSES = ['open', 'closed', 'awarded', 'cancelled'];
const BADGES = ['Critical', 'High Priority', 'Standard', 'AI/ML', 'Security', 'Healthcare', 'Mobile', 'Cloud'];
const USER_STATUSES = ['interested', 'preparing-bid', 'reviewing', 'maybe', 'not-interested'];

interface ProjectTuple {
  id: string;
  description: string;
  userId?: string;
  solicitationId?: string;
  title?: string;
  agency?: string;
  status?: string;
  badge?: string;
  postedDate?: string;
  closingDate?: string;
  samLink?: string;
  dibbsLink?: string;
  contactEmail?: string;
  isFavorite?: boolean;
  awardee?: string;
  awardAmount?: number;
  naicsCode?: string;
  userStatus?: string;
  budget?: number;
  timeline?: string;
}

/**
 * Generate a random project with dummy data
 */
function generateRandomProject(index: number): ProjectTuple {
  const projectType = PROJECT_TYPES[Math.floor(Math.random() * PROJECT_TYPES.length)];
  const agency = AGENCIES[Math.floor(Math.random() * AGENCIES.length)];
  const techStack = TECH_STACKS[Math.floor(Math.random() * TECH_STACKS.length)];
  const naicsCode = NAICS_CODES[Math.floor(Math.random() * NAICS_CODES.length)];
  const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
  const badge = BADGES[Math.floor(Math.random() * BADGES.length)];
  const userStatus = USER_STATUSES[Math.floor(Math.random() * USER_STATUSES.length)];

  // Generate random dates
  const postedDate = new Date();
  postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 90));
  const closingDate = new Date(postedDate);
  closingDate.setDate(closingDate.getDate() + Math.floor(Math.random() * 90) + 30);

  // Generate random budget
  const budget = Math.floor(Math.random() * 9900000) + 100000;

  // Random project details
  const duration = Math.floor(Math.random() * 30) + 6;
  const teamSize = Math.floor(Math.random() * 13) + 3;
  const requirements = [
    'cloud computing',
    'microservices',
    'containerization',
    'CI/CD',
    'agile development',
    'test-driven development',
    'DevOps practices',
  ];
  const compliance = [
    'Security clearance required',
    'HIPAA compliance needed',
    'FedRAMP certification preferred',
    'Agile methodology required',
    'SOC 2 compliance required',
    'NIST framework adherence',
  ];
  const deliverables = [
    'full system implementation',
    'proof of concept',
    'production deployment',
    'migration plan and execution',
    'comprehensive documentation',
    'training materials',
  ];

  const randomRequirement = requirements[Math.floor(Math.random() * requirements.length)];
  const randomCompliance = compliance[Math.floor(Math.random() * compliance.length)];
  const randomDeliverable = deliverables[Math.floor(Math.random() * deliverables.length)];

  // Generate project description
  const description = `${agency} is seeking a contractor for ${projectType.toLowerCase()}.

Technical Requirements:
- Technology Stack: ${techStack}
- Experience with ${randomRequirement}
- ${randomCompliance}

Project Scope:
- Duration: ${duration} months
- Team size: ${teamSize} developers
- Budget: $${budget.toLocaleString()}

Deliverables include ${randomDeliverable}. The contractor will work closely with agency stakeholders to ensure successful project delivery and meet all compliance requirements.`;

  const project: ProjectTuple = {
    id: `project-${String(index).padStart(4, '0')}`,
    description: description.trim(),
    userId: `user-${Math.floor(Math.random() * 9000) + 1000}`,
    solicitationId: `SOL-${agency.substring(0, 3).toUpperCase()}-2024-${Math.floor(Math.random() * 9000) + 1000}`,
    title: `${projectType} - ${agency}`,
    agency: agency,
    status: status,
    badge: badge,
    postedDate: postedDate.toISOString().split('T')[0],
    closingDate: closingDate.toISOString().split('T')[0],
    samLink: `https://sam.gov/opp/SOL-${agency.substring(0, 3).toUpperCase()}-2024-${Math.floor(Math.random() * 9000) + 1000}`,
    dibbsLink: `https://dibbs.gov/projects/project-${String(index).padStart(4, '0')}`,
    contactEmail: `procurement@${agency.toLowerCase().replace(/\s+/g, '')}.gov`,
    isFavorite: Math.random() > 0.7,
    naicsCode: naicsCode,
    userStatus: userStatus,
    budget: budget,
    timeline: `${duration} months`,
  };

  return project;
}

/**
 * Initialize the knowledge base
 */
async function initializeKnowledgeBase(): Promise<boolean> {
  console.log('\n📚 Step 1: Initializing Knowledge Base');
  console.log('='.repeat(80));

  try {
    console.log('🔄 Calling initializeKnowledgeBase function...');
    const result = await squid.executeFunction('initializeKnowledgeBase');
    console.log('📦 Response received:', JSON.stringify(result, null, 2));
    console.log('✅', result.message);
    return result.success;
  } catch (error: any) {
    if (error.message?.includes('FUNCTION_NOT_FOUND')) {
      console.error('❌ Error: Backend functions not deployed!');
      console.error('\n🚀 To fix this, run the following commands:');
      console.error('   1. cd c:\\Users\\umair\\Downloads\\Work\\squid\\squid-agents\\rfp-tracker-backend');
      console.error('   2. npm run deploy');
      console.error('   3. Wait for deployment to complete');
      console.error('   4. Run this test again\n');
      return false;
    }
    console.error('❌ Error initializing knowledge base:', error.message);
    console.log('⚠️  Knowledge base may already exist, continuing...');
    return true; // Continue even if KB already exists
  }
}

/**
 * Store projects in the knowledge base
 */
async function storeProjects(projects: ProjectTuple[]): Promise<boolean> {
  console.log(`\n📥 Step 2: Storing ${projects.length} Projects in Knowledge Base`);
  console.log('='.repeat(80));

  try {
    console.log('🔄 Calling storeProjects function...');
    const result = await squid.executeFunction('storeProjects', projects);
    console.log('📦 Response received:', JSON.stringify(result, null, 2));

    console.log('✅', result.message);
    console.log(`   Success: ${result.successCount} | Failures: ${result.failureCount}`);

    return result.success;
  } catch (error: any) {
    console.error('❌ Error storing projects:', error.message);
    return false;
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(18) + 'SQUID PROJECT UPLOADER (TypeScript)' + ' '.repeat(25) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  // Check if API key is set
  if (!API_KEY) {
    console.log('\n❌ ERROR: SQUID_API_KEY environment variable not set!');
    console.log('\nTo fix this:');
    console.log('  Windows: set SQUID_API_KEY=your_api_key_here');
    console.log('  Linux/Mac: export SQUID_API_KEY=your_api_key_here');
    process.exit(1);
  }

  // Get number of projects from command line or use default
  const numProjects = parseInt(process.argv[2]) || 10;

  console.log(`\n🎲 Generating ${numProjects} random projects...`);
  const projects = Array.from({ length: numProjects }, (_, i) => generateRandomProject(i + 1));

  console.log(`✅ Generated ${projects.length} projects`);
  console.log('\nSample project:');
  console.log(JSON.stringify(projects[0], null, 2));

  // Initialize knowledge base (optional, may already exist)
  console.log('\n\nInitializing knowledge base...');
  await initializeKnowledgeBase();

  // Store projects
  const success = await storeProjects(projects);

  if (success) {
    console.log('\n' + '='.repeat(80));
    console.log('✅ UPLOAD COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log(`\n📊 Summary:`);
    console.log(`   Total projects uploaded: ${projects.length}`);
    console.log(`   Knowledge Base ID: projects-kb`);
    console.log(`   App ID: rfz4m5p7nsqkan4818`);
    console.log(`   Environment: dev`);
    console.log('\n🏁 Exiting...');
    process.exit(0);
  } else {
    console.log('\n❌ UPLOAD FAILED');
    console.log('Please check your API key and ensure the backend is deployed');
    console.log('\n🏁 Exiting with error...');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('\n❌ FATAL ERROR:', error);
    console.error('Stack trace:', error.stack);
    console.log('\n🏁 Exiting with fatal error...');
    process.exit(1);
  });
}
