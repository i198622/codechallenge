
export interface IPull {
  id: number;
  title: string
  body: string;
  diff: string;
  is_merged: boolean;
}

export interface IReview {
  id: number;
  security: {
    grade: string;
    score: number;
  };
}