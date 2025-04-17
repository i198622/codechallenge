import { IReview } from "@/type";

type MetricKey = 'antiPatterns' | 'codeStyle' | 'designPatterns';

interface AggregationDetail {
  id: number;
  complexity: string;
  confidence: string;
  score: number;
  weight: number;
}

interface AggregationResult {
  aggregatedScore: number;
  details: AggregationDetail[];
}

const complexityWeight: Record<string, number> = {
  Low: 1.0,
  Medium: 1.5,
  High: 2.0,
};

const confidenceWeight: Record<string, number> = {
  Low: 0.75,
  Medium: 1.0,
  High: 1.25,
};

export function aggregateMetric(
  reviews: IReview[],
  metricKey: MetricKey
): AggregationResult {
  let numerator = 0;
  let denominator = 0;
  const details: AggregationDetail[] = [];

  for (const pr of reviews) {
    const id = pr.pull.id;
    const comp = pr.complexity.classification;
    const { confidence, score } = pr[metricKey];
    const weight = complexityWeight[comp] * confidenceWeight[confidence];

    numerator += score * weight;
    denominator += weight;

    details.push({
      id,
      complexity: comp,
      confidence,
      score,
      weight: Math.round(weight * 1000) / 1000,
    });
  }

  const aggScore = denominator > 0 ? numerator / denominator : 0;

  return {
    aggregatedScore: Math.round(aggScore * 100) / 100,
    details,
  };
}
