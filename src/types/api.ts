export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatErrorResponse {
  error: string;
  message?: string;
}

export interface GeminiHistoryMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}


export interface PromptQuota {
  limit: number;
  used: number;
  remaining: number;
  /** ISO timestamp of the next daily reset */
  resetsAt: string;
}
