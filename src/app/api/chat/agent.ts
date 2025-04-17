import { createGoogleGenerativeAI } from '@ai-sdk/google';
import omit from 'lodash/omit';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText, generateObject } from 'ai';
import { createOllama } from 'ollama-ai-provider';
import { z } from 'zod';
import { IPull, IReview, IReviewResult } from '@/type';
import { AgentPrompts } from '@/prompts/prompts';
import { Log } from '@/utils/log';
import { aggregateMetric } from '@/utils/calc';

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
  const pullReviews = await Promise.all(pulls.map((e) => processCodeReview(e)));

  // METRIC SUMMARY
  const metricData = pullReviews.map((e) => {
    return {
      summary: e.summary,
      antiPatterns: omit(e.antiPatterns, ['score']),
      complexity: e.complexity,
      designPatterns: omit(e.designPatterns, ['score']),
      codeStyle: omit(e.codeStyle, ['score', ''])
    };
  });
  const metricSummary = await generateObject({
    temperature: 0,
    model,
    system: AgentPrompts.employeeRreport.systemMetricsSummary,
    schema: z.object({
      metricsSummary: z.object({
        complexity: z.object({
          classification: z.string(),
          justification: z.string(),
        }),
        antiPatterns: z.object({
          confidence: z.enum(['Low', 'Medium', 'High']),
          detailed_analysis: z.string(),
          summary: z.string(),
          recommendations: z.array(z.string()),
        }),
        codeStyle: z.object({
          confidence: z.enum(['Low', 'Medium', 'High']),
          detailed_analysis: z.string(),
          summary: z.string(),
          recommendations: z.array(z.string()),
        }),
        designPatterns: z.object({
          confidence: z.enum(['Low', 'Medium', 'High']),
          detailed_analysis: z.string(),
          summary: z.string(),
          recommendations: z.array(z.string()),
        })
      }),
      totalSummary: z.string(),
    }),
    prompt: `${AgentPrompts.employeeRreport.promptMetricsSummary.replace('${METRIC_SUMMARY}', JSON.stringify(metricData))}`,
  });

  // TOTAL SUMMARY
  const totalSummaryData: any = {
    ...metricSummary.object,
  };
  const aggrAntiPatterns = aggregateMetric(pullReviews, 'antiPatterns');
  const aggrCodeStyle = aggregateMetric(pullReviews, 'codeStyle');
  const aggrDesignPatterns = aggregateMetric(pullReviews, 'designPatterns');
  aggrAntiPatterns.details[0].score;

  totalSummaryData.metricsSummary.antiPatterns['score'] = aggrAntiPatterns.aggregatedScore;
  totalSummaryData.metricsSummary.designPatterns['score'] = aggrDesignPatterns.aggregatedScore;
  totalSummaryData.metricsSummary.codeStyle['score'] = aggrCodeStyle.aggregatedScore;
  const totalScore = (aggrAntiPatterns.aggregatedScore + aggrDesignPatterns.aggregatedScore + aggrCodeStyle.aggregatedScore) / 3;
  const totalSummary = await generateObject({
    temperature: 0,
    system: AgentPrompts.employeeRreport.systemTotalSummary,
    model,
    schema: z.object({
      overall_assessment: z.string(),
      positives: z.array(z.string()),
      areas_for_improvement: z.array(z.string()),
    }),
    prompt: `${AgentPrompts.employeeRreport.promptTotalSummary.replace('${JSON_DATA}', JSON.stringify(totalSummaryData))}`,
  });

  // // SUMMARY TEXT
  // const { text: summary } = await generateText({
  //   temperature: 0,
  //   model,
  //   system: AgentPrompts.employeeRreport.system,
  //   prompt: AgentPrompts.employeeRreport.promptReportTemplate
  //     .replace('${DATA}', JSON.stringify(pullReviews)),
  // });

  const result = { pullReviews , summary: ''};
  
  Log(JSON.stringify({
    ...result,
    totalScore,
    totalSummary,
    metricSummary,
  }));

  return result;
}