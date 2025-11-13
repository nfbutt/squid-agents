import { SquidService, executable } from '@squidcloud/backend';

/**
 * Matching service that uses AI to compare company profiles against project descriptions
 * and computes matching scores to determine if projects are a good fit.
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

// noinspection JSUnusedGlobalSymbols
export class MatchingService extends SquidService {
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
