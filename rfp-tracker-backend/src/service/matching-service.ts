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
  title?: string;
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
            name: 'title',
            dataType: 'string',
            required: false,
            description: 'Title or name of the project',
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
          title: metadata?.title,
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
        title: `Project ${project.id}`,
        text: project.description,
        metadata: {
          projectId: project.id,
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
