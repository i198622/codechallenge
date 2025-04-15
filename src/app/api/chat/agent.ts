import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { z } from 'zod';

// Example: Parallel code review with multiple specialized reviewers
export async function parallelCodeReview(code: string) {
  const ollama = createOllama({
    baseURL: "http://10.50.29.102:11434/api/",
  });
  // const ollama = createOllama({
  //   baseURL: "https://neuralhelper.ru/ollama/api/",
  //   headers: {
  //     Authorization: "Basic ZnJwc191c2VyOmVqcmozOHU5Mm5ram5iZitlb2RqXzNuMzlk",
  //   },
  // });

  const model = ollama("qwen2.5-coder:32b");
  // const openrouter = createOpenRouter({
  //   apiKey: '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',
  // });

  // const model = openrouter.chat('google/gemini-2.5-pro-exp-03-25:free');

  // Run parallel reviews
  const [securityReview, performanceReview, maintainabilityReview] =
    await Promise.all([
      generateObject({
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

  // Aggregate results using another model instance
  const { text: summary } = await generateText({
    model,
    system: 'You are a technical lead summarizing multiple code reviews.',
    prompt: `Synthesize these code review results into a concise summary with key actions:
    ${JSON.stringify(reviews, null, 2)}

    Ответ напиши на русском языке.
    `,
  });

  return { reviews, summary };
}