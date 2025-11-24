import { SquidService, executable } from '@squidcloud/backend';

/**
 * Matching service that uses AI to compare company profiles against project descriptions
 * and computes matching scores to determine if projects are a good fit.
 *
 * Uses a knowledge base to store projects and perform semantic similarity searches.
 */

export interface ProjectTuple {
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

export interface MatchingResult {
  id: string;
  score: number;
  isGoodFit: boolean;
  reasoning: string;
  matchedAreas: string[];
}

export interface ProjectMetadata {
  projectId: string;
  userId?: string;
  solicitationId?: string;
  title?: string;
  description?: string;
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
  addedAt: string;
}

// noinspection JSUnusedGlobalSymbols
export class MatchingService extends SquidService {
  private readonly KNOWLEDGE_BASE_ID = 'projects-kb';

  /**
   * Initializes the knowledge base for storing projects
   * This should be called once to set up the knowledge base
   */
  @executable()
  async initializeKnowledgeBase(): Promise<{ success: boolean; message: string }> {
    try {
      const kb = this.squid.ai().knowledgeBase(this.KNOWLEDGE_BASE_ID);
      await kb.upsertKnowledgeBase({
        description: 'Knowledge base for storing project descriptions and requirements for matching',
        embeddingModel: 'text-embedding-3-small',
        metadataFields: [
          {
            name: 'projectId',
            dataType: 'string',
            required: true,
            description: 'Unique identifier for the project',
          },
          {
            name: 'userId',
            dataType: 'string',
            required: false,
            description: 'User ID associated with the project',
          },
          {
            name: 'solicitationId',
            dataType: 'string',
            required: false,
            description: 'Solicitation ID from SAM.gov',
          },
          {
            name: 'title',
            dataType: 'string',
            required: false,
            description: 'Title or name of the project',
          },
          {
            name: 'description',
            dataType: 'string',
            required: false,
            description: 'Full description of the project',
          },
          {
            name: 'agency',
            dataType: 'string',
            required: false,
            description: 'Government agency posting the project',
          },
          {
            name: 'status',
            dataType: 'string',
            required: false,
            description: 'Current status of the project',
          },
          {
            name: 'badge',
            dataType: 'string',
            required: false,
            description: 'Badge or label for the project',
          },
          {
            name: 'postedDate',
            dataType: 'string',
            required: false,
            description: 'Date when the project was posted',
          },
          {
            name: 'closingDate',
            dataType: 'string',
            required: false,
            description: 'Closing date for project submissions',
          },
          {
            name: 'samLink',
            dataType: 'string',
            required: false,
            description: 'Link to SAM.gov listing',
          },
          {
            name: 'dibbsLink',
            dataType: 'string',
            required: false,
            description: 'Link to DIBBS listing',
          },
          {
            name: 'contactEmail',
            dataType: 'string',
            required: false,
            description: 'Contact email for the project',
          },
          {
            name: 'isFavorite',
            dataType: 'boolean',
            required: false,
            description: 'Whether the project is marked as favorite',
          },
          {
            name: 'awardee',
            dataType: 'string',
            required: false,
            description: 'Name of the contract awardee',
          },
          {
            name: 'awardAmount',
            dataType: 'number',
            required: false,
            description: 'Award amount in dollars',
          },
          {
            name: 'naicsCode',
            dataType: 'string',
            required: false,
            description: 'NAICS code for the project',
          },
          {
            name: 'userStatus',
            dataType: 'string',
            required: false,
            description: 'User-specific status for the project',
          },
          {
            name: 'budget',
            dataType: 'number',
            required: false,
            description: 'Project budget in dollars',
          },
          {
            name: 'timeline',
            dataType: 'string',
            required: false,
            description: 'Expected timeline for the project',
          },
          {
            name: 'addedAt',
            dataType: 'string',
            required: true,
            description: 'Timestamp when the project was added',
          },
        ],
      });

      return {
        success: true,
        message: 'Knowledge base initialized successfully',
      };
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      return {
        success: false,
        message: `Failed to initialize knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Stores a project in the knowledge base
   * @param project - Project to store
   * @param metadata - Optional metadata about the project
   */
  @executable()
  async storeProject(
    project: ProjectTuple,
    metadata?: Partial<Omit<ProjectMetadata, 'projectId' | 'addedAt'>>
  ): Promise<{ success: boolean; message: string }> {
    try {
      const kb = this.squid.ai().knowledgeBase(this.KNOWLEDGE_BASE_ID);

      await kb.upsertContext({
        contextId: project.id,
        type: 'text',
        title: metadata?.title || `Project ${project.id}`,
        text: project.description,
        metadata: {
          projectId: project.id,
          userId: metadata?.userId,
          solicitationId: metadata?.solicitationId,
          title: metadata?.title,
          description: metadata?.description,
          agency: metadata?.agency,
          status: metadata?.status,
          badge: metadata?.badge,
          postedDate: metadata?.postedDate,
          closingDate: metadata?.closingDate,
          samLink: metadata?.samLink,
          dibbsLink: metadata?.dibbsLink,
          contactEmail: metadata?.contactEmail,
          isFavorite: metadata?.isFavorite,
          awardee: metadata?.awardee,
          awardAmount: metadata?.awardAmount,
          naicsCode: metadata?.naicsCode,
          userStatus: metadata?.userStatus,
          budget: metadata?.budget,
          timeline: metadata?.timeline,
          addedAt: new Date().toISOString(),
        },
      });

      return {
        success: true,
        message: `Project ${project.id} stored successfully`,
      };
    } catch (error) {
      console.error(`Error storing project ${project.id}:`, error);
      return {
        success: false,
        message: `Failed to store project: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Stores multiple projects in the knowledge base at once
   * @param projects - Array of projects to store
   */
  @executable()
  async storeProjects(projects: ProjectTuple[]): Promise<{
    success: boolean;
    message: string;
    successCount: number;
    failureCount: number;
  }> {
    try {
      const kb = this.squid.ai().knowledgeBase(this.KNOWLEDGE_BASE_ID);

      const contextRequests = projects.map((project) => ({
        contextId: project.id,
        type: 'text' as const,
        title: project.title || `Project ${project.id}`,
        text: project.description,
        metadata: {
          projectId: project.id,
          userId: project.userId,
          solicitationId: project.solicitationId,
          title: project.title,
          description: project.description,
          agency: project.agency,
          status: project.status,
          badge: project.badge,
          postedDate: project.postedDate,
          closingDate: project.closingDate,
          samLink: project.samLink,
          dibbsLink: project.dibbsLink,
          contactEmail: project.contactEmail,
          isFavorite: project.isFavorite,
          awardee: project.awardee,
          awardAmount: project.awardAmount,
          naicsCode: project.naicsCode,
          userStatus: project.userStatus,
          budget: project.budget,
          timeline: project.timeline,
          addedAt: new Date().toISOString(),
        },
      }));

      const response = await kb.upsertContexts(contextRequests);

      const failureCount = response.failures?.length || 0;
      const successCount = projects.length - failureCount;

      return {
        success: failureCount === 0,
        message:
          failureCount === 0
            ? `All ${successCount} projects stored successfully`
            : `${successCount} projects stored, ${failureCount} failed`,
        successCount,
        failureCount,
      };
    } catch (error) {
      console.error('Error storing projects:', error);
      return {
        success: false,
        message: `Failed to store projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
        successCount: 0,
        failureCount: projects.length,
      };
    }
  }

  /**
   * Searches for matching projects using semantic similarity
   * @param companyProfile - Company profile to match against
   * @param limit - Maximum number of results to return (default: 10)
   * @param threshold - Minimum score threshold (default: 60)
   * @returns Array of matching results with reasoning
   */
  @executable()
  async matchProjectsWithKnowledgeBase(
    companyProfile: string,
    limit: number = 10,
    threshold: number = 60
  ): Promise<MatchingResult[]> {
    if (!companyProfile) {
      throw new Error('Company profile is required');
    }

    try {
      const kb = this.squid.ai().knowledgeBase(this.KNOWLEDGE_BASE_ID);

      // Perform semantic search using the company profile as the prompt
      const results = await kb.searchContextsWithPrompt({
        prompt: `Find projects that match this company profile:\n\n${companyProfile}`,
        limit,
        rerank: true,
      });

      // Transform results to MatchingResult format
      const matchingResults: MatchingResult[] = results.map((result) => {
        const projectId = result.context.metadata.projectId as string;
        const score = result.score;

        return {
          id: projectId,
          score,
          isGoodFit: score >= threshold,
          reasoning: result.reasoning || 'No reasoning provided',
          matchedAreas: this.extractMatchedAreas(result.context.text, companyProfile),
        };
      });

      return matchingResults.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error matching projects with knowledge base:', error);
      throw new Error(`Failed to match projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if a project is a good fit by analyzing similar projects in the knowledge base
   * @param projectDescription - The project to evaluate
   * @param companyProfile - Company profile to match against
   * @param similarityThreshold - Minimum score for similar projects (default: 70)
   * @param fitThreshold - Minimum score for company fit (default: 60)
   * @param limitSimilar - Number of similar projects to check (default: 10)
   * @returns Analysis of whether the project is a good fit based on similar projects
   */
  @executable()
  async isProjectGoodFitByKnowledgeBase(
    projectDescription: string,
    companyProfile: string,
    similarityThreshold: number = 70,
    fitThreshold: number = 60,
    limitSimilar: number = 10
  ): Promise<{
    isGoodFit: boolean;
    confidence: number;
    reasoning: string;
    similarProjects: Array<{
      id: string;
      similarity: number;
      companyFitScore: number;
      isCompanyFit: boolean;
    }>;
    statistics: {
      totalSimilarProjects: number;
      goodFitProjects: number;
      goodFitPercentage: number;
      averageFitScore: number;
    };
  }> {
    if (!projectDescription || !companyProfile) {
      throw new Error('Project description and company profile are required');
    }

    try {
      const kb = this.squid.ai().knowledgeBase(this.KNOWLEDGE_BASE_ID);

      // Step 1: Find similar projects using the project description
      console.log('Searching for similar projects in knowledge base...');
      const similarProjectResults = await kb.searchContextsWithPrompt({
        prompt: `Find projects similar to this one:\n\n${projectDescription}`,
        limit: limitSimilar,
        rerank: true,
      });
      console.log(`Found ${similarProjectResults.length} similar projects`);

      // Filter by similarity threshold
      const relevantSimilarProjects = similarProjectResults.filter(
        (result) => result.score >= similarityThreshold
      );

      if (relevantSimilarProjects.length === 0) {
        return {
          isGoodFit: false,
          confidence: 0,
          reasoning: 'No similar projects found in knowledge base to make a comparison.',
          similarProjects: [],
          statistics: {
            totalSimilarProjects: 0,
            goodFitProjects: 0,
            goodFitPercentage: 0,
            averageFitScore: 0,
          },
        };
      }

      // Step 2: For each similar project, check how well it fits the company
      console.log(`Analyzing ${relevantSimilarProjects.length} relevant similar projects...`);
      const agent = this.squid.ai().agent('matching-agent');

      const similarProjectsAnalysis: Array<{
        id: string;
        similarity: number;
        companyFitScore: number;
        isCompanyFit: boolean;
      }> = [];

      for (const similarProject of relevantSimilarProjects) {
        try {
          const prompt = this.buildMatchingPrompt(companyProfile, similarProject.context.text);

          const response = await agent.ask(prompt, {
            responseFormat: 'json_object',
            temperature: 0.3,
            instructions:
              'You are an expert at matching company capabilities with project requirements. Analyze the alignment and provide a score from 0-100.',
          });

          const matchData = JSON.parse(response);
          const companyFitScore = matchData.score || 0;

          similarProjectsAnalysis.push({
            id: similarProject.context.metadata.projectId as string,
            similarity: similarProject.score,
            companyFitScore,
            isCompanyFit: companyFitScore >= fitThreshold,
          });
          console.log(
            `  ✓ ${similarProject.context.metadata.projectId}: similarity=${similarProject.score}, fit=${companyFitScore}`
          );
        } catch (error) {
          console.error(
            `  ✗ Error analyzing similar project ${similarProject.context.metadata.projectId}:`,
            error instanceof Error ? error.message : error
          );
          // Continue with other projects even if one fails
        }
      }
      console.log(`Successfully analyzed ${similarProjectsAnalysis.length} projects`);

      // Step 3: Calculate statistics
      const totalSimilarProjects = similarProjectsAnalysis.length;

      // Check if we have any successfully analyzed projects
      if (totalSimilarProjects === 0) {
        return {
          isGoodFit: false,
          confidence: 0,
          reasoning: 'Unable to analyze similar projects. No similar projects could be successfully processed.',
          similarProjects: [],
          statistics: {
            totalSimilarProjects: 0,
            goodFitProjects: 0,
            goodFitPercentage: 0,
            averageFitScore: 0,
          },
        };
      }

      const goodFitProjects = similarProjectsAnalysis.filter((p) => p.isCompanyFit).length;
      const goodFitPercentage = (goodFitProjects / totalSimilarProjects) * 100;
      const averageFitScore =
        similarProjectsAnalysis.reduce((sum, p) => sum + p.companyFitScore, 0) /
        totalSimilarProjects;

      // Step 4: Determine if the project is a good fit (50% threshold)
      const isGoodFit = goodFitPercentage >= 50;
      const confidence = Math.round(goodFitPercentage);

      // Step 5: Generate reasoning
      const reasoning = this.generateFitReasoning(
        isGoodFit,
        goodFitPercentage,
        averageFitScore,
        totalSimilarProjects,
        goodFitProjects
      );

      return {
        isGoodFit,
        confidence,
        reasoning,
        similarProjects: similarProjectsAnalysis,
        statistics: {
          totalSimilarProjects,
          goodFitProjects,
          goodFitPercentage: Math.round(goodFitPercentage * 100) / 100,
          averageFitScore: Math.round(averageFitScore * 100) / 100,
        },
      };
    } catch (error) {
      console.error('Error checking project fit by knowledge base:', error);
      throw new Error(
        `Failed to check project fit: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate reasoning for the fit analysis
   */
  private generateFitReasoning(
    isGoodFit: boolean,
    goodFitPercentage: number,
    averageFitScore: number,
    totalProjects: number,
    goodFitProjects: number
  ): string {
    const percentage = Math.round(goodFitPercentage);
    const avgScore = Math.round(averageFitScore);

    if (isGoodFit) {
      return `This project is a GOOD FIT for your company. Analysis of ${totalProjects} similar projects shows that ${goodFitProjects} (${percentage}%) are a good match for your capabilities, with an average fit score of ${avgScore}/100. This indicates strong alignment between your company profile and projects of this type.`;
    } else {
      return `This project may NOT be a good fit for your company. Analysis of ${totalProjects} similar projects shows that only ${goodFitProjects} (${percentage}%) are a good match for your capabilities, with an average fit score of ${avgScore}/100. This suggests potential gaps between your company profile and projects of this type.`;
    }
  }

  /**
   * Helper method to extract matched areas from context (simplified version)
   */
  private extractMatchedAreas(projectDescription: string, companyProfile: string): string[] {
    const areas: string[] = [];
    const technologies = [
      'React',
      'Node.js',
      'TypeScript',
      'Python',
      'AWS',
      'PostgreSQL',
      'MongoDB',
      'GraphQL',
      'Docker',
      'Kubernetes',
    ];

    // Simple keyword matching to identify common areas
    technologies.forEach((tech) => {
      if (
        projectDescription.toLowerCase().includes(tech.toLowerCase()) &&
        companyProfile.toLowerCase().includes(tech.toLowerCase())
      ) {
        areas.push(tech);
      }
    });

    return areas.length > 0 ? areas : ['General capabilities match'];
  }

  /**
   * Matches a company profile against a list of project descriptions using AI
   * @param companyProfile - Text description of the company's profile, capabilities, and expertise
   * @param projects - List of tuples containing project id and description
   * @param agentId - ID of the AI agent to use (default: 'matching-agent')
   * @param threshold - Optional threshold for determining good fit (default: 60)
   * @returns Array of matching results with scores and fit determination
   */
  @executable()
  async matchProjects(
    companyProfile: string,
    projects: ProjectTuple[],
    agentId: string = 'matching-agent',
    threshold: number = 60
  ): Promise<MatchingResult[]> {
    if (!companyProfile || !projects || projects.length === 0) {
      throw new Error('Company profile and projects list are required');
    }

    const agent = this.squid.ai().agent(agentId);
    const results: MatchingResult[] = [];

    // Process each project with the AI agent
    for (const project of projects) {
      try {
        const prompt = this.buildMatchingPrompt(companyProfile, project.description);

        const response = await agent.ask(prompt, {
          responseFormat: 'json_object',
          temperature: 0.3, // Lower temperature for more consistent scoring
          instructions: 'You are an expert at matching company capabilities with project requirements. Analyze the alignment between the company profile and project description, then provide a matching score from 0-100 and detailed reasoning.',
        });

        const matchData = JSON.parse(response);

        results.push({
          id: project.id,
          score: matchData.score || 0,
          isGoodFit: (matchData.score || 0) >= threshold,
          reasoning: matchData.reasoning || 'No reasoning provided',
          matchedAreas: matchData.matchedAreas || [],
        });
      } catch (error) {
        console.error(`Error matching project ${project.id}:`, error);
        results.push({
          id: project.id,
          score: 0,
          isGoodFit: false,
          reasoning: `Error processing: ${error instanceof Error ? error.message : 'Unknown error'}`,
          matchedAreas: [],
        });
      }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Build the matching prompt for the AI agent
   */
  private buildMatchingPrompt(companyProfile: string, projectDescription: string): string {
    return `Analyze how well this company matches with the project requirements.

Company Profile:
${companyProfile}

Project Description:
${projectDescription}

Evaluate the match and respond with a JSON object containing:
{
  "score": <number from 0-100>,
  "reasoning": "<detailed explanation of why this score was given>",
  "matchedAreas": [<array of specific areas where company capabilities align with project needs>]
}

Consider the following factors:
- Technical skills and expertise alignment
- Industry experience and domain knowledge
- Company size and capacity to handle the project
- Relevant past work or specializations
- Any specific requirements mentioned in the project description

Provide a score where:
- 90-100: Excellent fit, company strongly matches all key requirements
- 70-89: Good fit, company matches most requirements with minor gaps
- 50-69: Moderate fit, some alignment but notable gaps exist
- 30-49: Poor fit, limited alignment with requirements
- 0-29: Very poor fit, significant misalignment`;
  }

  /**
   * Batch match with better performance for large lists
   * Processes multiple projects in parallel batches
   */
  @executable()
  async matchProjectsBatch(
    companyProfile: string,
    projects: ProjectTuple[],
    agentId: string = 'matching-agent',
    threshold: number = 60,
    batchSize: number = 5
  ): Promise<MatchingResult[]> {
    const results: MatchingResult[] = [];

    // Process in batches to avoid overwhelming the AI service
    for (let i = 0; i < projects.length; i += batchSize) {
      const batch = projects.slice(i, i + batchSize);
      const batchResults = await this.matchProjects(companyProfile, batch, agentId, threshold);
      results.push(...batchResults);
    }

    return results.sort((a, b) => b.score - a.score);
  }
}
