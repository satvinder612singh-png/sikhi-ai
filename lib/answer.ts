/** Shape shared by the API route and the UI. */
export type CitationType = "Gurbani" | "History" | "Scholarship";

export type Citation = {
  type: CitationType;
  label: string;
  detail: string;
};

export type Answer = {
  question: string;
  answer: string[];
  citations: Citation[];
};

export const MIN_PROMPT = 3;
export const MAX_PROMPT = 500;
