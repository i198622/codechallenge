export interface IPull {
  id: number;
  title: string
  body: string;
  diff: string;
  is_merged: boolean;
}

export interface IBaseReview {
  detailed_analysis: string;
  recommendations: string[]
  confidence: string;
  score: number;
  summary: string;
}

export interface IComplexity {
  classification: string;
  justification: string;
}
export interface IReview {
  pull: IPull;
  codeStyle: IBaseReview;
  antiPatterns: IBaseReview;
  summary: string;
  complexity: IComplexity;
  designPatterns: IBaseReview,
}

export interface IReviewResult {
  pullReviews: IReview[];
  summary: string;
}
