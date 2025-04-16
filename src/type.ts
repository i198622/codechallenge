export interface IPull {
  id: number;
  title: string
  body: string;
  diff: string;
  is_merged: boolean;
}

export interface IReview {
  pull: IPull;
  security: {
    grade: string;
    score: number;
  };
}

export interface IReviewResult {
  pullReviews: IReview[];
}
