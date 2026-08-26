// 1. Direct path where our LLM actually knows and we don't need to search the web
// 2. Web path --> browse, summarize, result urls

// Note: every candidate should have the same schema for the runnable interface

export type candidate = {
  answer: string;
  sources: string[]; // urls of the sources used to answer the question in direct mode it will be empty
  mode: 'direct' | 'web';
};
