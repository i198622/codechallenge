import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { z } from 'zod';
import { AgentPrompts } from './prompts';
import { IPull, IReview } from '@/type';

// const ollama = createOllama({
//   baseURL: "http://10.50.29.102:11434/api/",
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
    // generateText({
    //   model,
    //   maxTokens: 1000,
    //   temperature: 0,
    //   system: AgentPrompts.systemCodeSecurity,
    //   prompt: `Review this pull request:
      
    //   ${code}
    //   `
    // }),

    // generateText({
    //   model,
    //   maxTokens: 1000,
    //   temperature: 0,
    //   system: AgentPrompts.systemFunctionality,
    //   prompt: `Review this pull request:
      
    //   ${code}
    //   `
    // }),

    // generateText({
    //   model,
    //   maxTokens: 1000,
    //   temperature: 0,
    //   system: AgentPrompts.systemReadability,
    //   prompt: `Review this pull request:
      
    //   ${code}
    //   `
    // })
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

    // generateObject({
    //   temperature: 0,
    //   model,
    //   system:
    //     'You are an expert in code performance. Focus on identifying performance bottlenecks, memory leaks, and optimization opportunities.',
    //   schema: z.object({
    //     issues: z.array(z.string()),
    //     impact: z.enum(['low', 'medium', 'high']),
    //     optimizations: z.array(z.string()),
    //   }),
    //   prompt: `Review this code:
    // ${code}`,
    // }),

    // generateObject({
    //   temperature: 0,
    //   model,
    //   system:
    //     'You are an expert in code quality. Focus on code structure, readability, and adherence to best practices.',
    //   schema: z.object({
    //     concerns: z.array(z.string()),
    //     qualityScore: z.number().min(1).max(10),
    //     recommendations: z.array(z.string()),
    //   }),
    //   prompt: `Review this code:
    // ${code}`,
    // }),
    generateObject({
      temperature: 0,
      model,
      system: AgentPrompts.systemCodeSecurity,
      schema: z.object({
        grade: z.enum(['junior', 'junior+', 'middle', 'middle+', 'senior', 'senior+']),
        score: z.number(),
        summary: z.string(),
      }),
      prompt: `Review this pull request:
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
    security: securityReview.object,
    id: pullRequest.id
  };

  return review as IReview;
}

export async function parallelCodeReview(pulls: IPull[]) {
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