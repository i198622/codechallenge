import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { z } from 'zod';

// const ollama = createOllama({
//   baseURL: "http://10.50.29.102:11434/api/",
// });
// const ollama = createOllama({
//   baseURL: "https://neuralhelper.ru/ollama/api/",
//   headers: {
//     Authorization: "Basic ZnJwc191c2VyOmVqcmozOHU5Mm5ram5iZitlb2RqXzNuMzlk",
//   },
// });

// const model = ollama("qwen2.5-coder:32b");

const google = createGoogleGenerativeAI({
  // custom settings
  apiKey: 'AIzaSyDEnOnKwc57D-ksUfv5qkt8a8aEpB18ii0',
});

const model = google('gemini-2.5-pro-exp-03-25');

// const openrouter = createOpenRouter({
//   apiKey: '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',
// });
// const model = openrouter.chat('google/gemini-2.5-pro-exp-03-25:free');

async function processCodeReview(code: string) {
  const [securityReview, performanceReview, maintainabilityReview] = await Promise.all([
    generateObject({
      temperature: 0,
      model,
      system:
        'You are an expert in code security. Focus on identifying security vulnerabilities, injection risks, and authentication issues.',
      schema: z.object({
        vulnerabilities: z.array(z.string()),
        riskLevel: z.enum(['low', 'medium', 'high']),
        suggestions: z.array(z.string()),
      }),
      prompt: `Review this code:
    ${code}`,
    }),

    generateObject({
      temperature: 0,
      model,
      system:
        'You are an expert in code performance. Focus on identifying performance bottlenecks, memory leaks, and optimization opportunities.',
      schema: z.object({
        issues: z.array(z.string()),
        impact: z.enum(['low', 'medium', 'high']),
        optimizations: z.array(z.string()),
      }),
      prompt: `Review this code:
    ${code}`,
    }),

    generateObject({
      temperature: 0,
      model,
      system:
        'You are an expert in code quality. Focus on code structure, readability, and adherence to best practices.',
      schema: z.object({
        concerns: z.array(z.string()),
        qualityScore: z.number().min(1).max(10),
        recommendations: z.array(z.string()),
      }),
      prompt: `Review this code:
    ${code}`,
    }),
  ]);

  const reviews = [
    { ...securityReview.object, type: 'security' },
    { ...performanceReview.object, type: 'performance' },
    { ...maintainabilityReview.object, type: 'maintainability' },
  ];

  return reviews;
}

export async function parallelCodeReview(code: string) {
  const reviews = await processCodeReview(code);

  // Aggregate results using another model instance
  const { text: summary } = await generateText({
    temperature: 0,
    model,
    system: 'You are a technical lead summarizing multiple code reviews.',
    prompt: `Assess the level of a developer based on code reviews and rate their potential on a 10-point scale use Russian language

    ----- reviews -----
    ${JSON.stringify(reviews, null, 2)}
    -----
    `,
  });

  return { reviews, summary };
}