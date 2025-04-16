import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { z } from 'zod';
import { IPull, IReview, IReviewResult } from '@/type';
import { AgentPrompts } from '@/prompts/prompts';

// const ollama = createOllama({
//   baseURL: "http://10.50.31.20:11434/api/",
// });
const ollama = createOllama({
  baseURL: "https://neuralhelper.ru/ollama/api/",
  headers: {
    Authorization: "Basic ZnJwc191c2VyOmVqcmozOHU5Mm5ram5iZitlb2RqXzNuMzlk",
  },
});

const model = ollama("qwen2.5-coder:32b");

// const google = createGoogleGenerativeAI({
//   // custom settings
//   apiKey: 'AIzaSyDEnOnKwc57D-ksUfv5qkt8a8aEpB18ii0',
// });

// const model = google('gemini-2.5-pro-exp-03-25');

// const openrouter = createOpenRouter({
//   apiKey: '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',
// });
// const model = openrouter.chat('google/gemini-2.5-pro-exp-03-25:free');


// security
// Functionality
//  Readability and Maintainability


async function processCodeReview(pullRequest: IPull): Promise<IReview> {
  const [securityReview] = await Promise.all([
    
    // ANTI PATTERNS
    generateObject({
      temperature: 0,
      model,
      system: AgentPrompts.antiPatterns.system,
      schema: z.object({
        // grade: z.enum(['junior', 'junior+', 'middle', 'middle+', 'senior', 'senior+']).describe('Developer grade'),
        score: z.number().describe('Review score'),
        summary: z.string().describe('Summary text'),
      }),
      prompt: `
        ${AgentPrompts.antiPatterns.prompt}

        Review this pull request:
          Title: ${pullRequest.title}
          Description: ${pullRequest.body}
          Merged: ${pullRequest.is_merged}
          Diff:
          ${pullRequest.diff}
      `,
    }),
  ]);

  // const reviews = [
  //   { ...securityReview, type: 'security' },
  //   { ...functionalityReview, type: 'performance' },
  //   { ...maintainabilityReview.object, type: 'maintainability' },
  // ];

  // generateObject({
    //   temperature: 0,
    //   model,
    //   system:
    //     'You are an expert in code security. Focus on identifying security vulnerabilities, injection risks, and authentication issues.',
    //   schema: z.object({
    //     vulnerabilities: z.array(z.string()),
    //     riskLevel: z.enum(['low', 'medium', 'high']),
    //     suggestions: z.array(z.string()),
    //   }),
    //   prompt: `Review this code:
    // ${code}`,
    // }),

  const review = {
    pull: pullRequest,
    security: securityReview.object,
  };

  return review as IReview;
}

export async function parallelCodeReview(pulls: IPull[]): Promise<IReviewResult> {
  const pullReviews = [];

  for (let pull of pulls) {
    const result = await processCodeReview(pull);
    pullReviews.push(result);
  }

  // const reviews = await processCodeReview(code);

  // Aggregate results using another model instance
  // const { text: summary } = await generateText({
  //   temperature: 0,
  //   model,
  //   system: 'You are a technical lead summarizing multiple code reviews.',
  //   prompt: `Assess the level of a developer based on code reviews and rate their potential on a 10-point scale use Russian language

  //   ${reviews}
  //   `,
  // });

  return { pullReviews };
}