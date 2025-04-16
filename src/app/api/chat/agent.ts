import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { z } from 'zod';
import { IPull, IReview, IReviewResult } from '@/type';
import { AgentPrompts } from '@/prompts/prompts';
import { Log } from '@/utils/log';

// const ollama = createOllama({
//   baseURL: "http://10.50.31.20:11434/api/",
// });
// const ollama = createOllama({
//   baseURL: "https://neuralhelper.ru/ollama/api/",
//   headers: {
//     Authorization: "Basic ZnJwc191c2VyOmVqcmozOHU5Mm5ram5iZitlb2RqXzNuMzlk",
//   },
// });

// const model = ollama("qwen2.5-coder:32b");

// const google = createGoogleGenerativeAI({
//   // custom settings
//   apiKey: 'AIzaSyDEnOnKwc57D-ksUfv5qkt8a8aEpB18ii0',
// });

// const model = google('gemini-2.5-pro-exp-03-25');

const openrouter = createOpenRouter({
  // apiKey: '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',
  apiKey: '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', // Vanya
});
const model = openrouter.chat('google/gemini-2.5-pro-preview-03-25');

async function processCodeReview(pullRequest: IPull): Promise<IReview> {
  const [antiPatternsReview, codeStyleReview, complexityReview, designPatternsReview] = await Promise.all([
    // ANTI PATTERNS
    generateObject({
      temperature: 0,
      model,
      system: AgentPrompts.antiPatterns.system,
      schema: z.object({
        detailed_analysis: z.string(),
        recommendations: z.array(z.string()),
        confidence: z.enum(['Low', 'Medium', 'High']),
        score: z.number(),
        summary: z.string(),
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

    // CODE STYLE
    generateObject({
      temperature: 0,
      model,
      system: AgentPrompts.codeStyle.system,
      schema: z.object({
        detailed_analysis: z.string(),
        recommendations: z.array(z.string()),
        confidence: z.enum(['Low', 'Medium', 'High']),
        score: z.number(),
        summary: z.string(),
      }),
      prompt: `
        ${AgentPrompts.codeStyle.prompt}
        Review this pull request:
          Title: ${pullRequest.title}
          Description: ${pullRequest.body}
          Merged: ${pullRequest.is_merged}
          Diff:
          ${pullRequest.diff}
      `,
    }),

    // COMPLEXITY
    generateObject({
      temperature: 0,
      model,
      system: AgentPrompts.complexity.system,
      schema: z.object({
        justification: z.string(),
        classification: z.enum(['Low', 'Medium', 'High']),
      }),
      prompt: `
        ${AgentPrompts.complexity.prompt}
        Review this pull request:
          Title: ${pullRequest.title}
          Description: ${pullRequest.body}
          Merged: ${pullRequest.is_merged}
          Diff:
        ${pullRequest.diff}
      `,
    }),

    // DESIGN PATTERNS
    generateObject({
      temperature: 0,
      model,
      system: AgentPrompts.designPatterns.system,
      schema: z.object({
        detailed_analysis: z.string(),
        recommendations: z.array(z.string()),
        confidence: z.enum(['Low', 'Medium', 'High']),
        score: z.number(),
        summary: z.string(),
      }),
      prompt: `
        ${AgentPrompts.designPatterns.prompt}
        Review this pull request:
          Title: ${pullRequest.title}
          Description: ${pullRequest.body}
          Merged: ${pullRequest.is_merged}
          Diff:
        ${pullRequest.diff}
      `,
    }),
  ]);

  const summaryPrompt = AgentPrompts.mrReport.prompt
    .replace('${COMPLEXITY}', JSON.stringify(complexityReview.object))
    .replace('${CODE_STYLE}', JSON.stringify(codeStyleReview.object))
    .replace('${DESIGN_PATTERNS}', JSON.stringify(designPatternsReview.object))
    .replace('${ANTI_PATTERNS}', JSON.stringify(antiPatternsReview.object));

  // PULL SUMMARY
  const summary = await generateText({
    temperature: 0,
    model,
    system: AgentPrompts.mrReport.system,
    prompt: summaryPrompt,
  });

  const review = {
    pull: pullRequest,
    summary: summary.text,
    antiPatterns: antiPatternsReview.object,
    complexity: complexityReview.object,
    designPatterns: designPatternsReview.object,
    codeStyle: codeStyleReview.object,
  };

  return review;
}

export async function parallelCodeReview(pulls: IPull[]): Promise<IReviewResult> {
  const pullReviews = [];

  for (let pull of pulls) {
    const result = await processCodeReview(pull);
    pullReviews.push(result);
  }

  const { text: summary } = await generateText({
    temperature: 0,
    model,
    system: AgentPrompts.employeeRreport.system,
    prompt: AgentPrompts.employeeRreport.prompt.replace('${DATA}', JSON.stringify(pullReviews)),
  });

  const result = { pullReviews , summary};
  
  Log(JSON.stringify(result));

  return result;
}