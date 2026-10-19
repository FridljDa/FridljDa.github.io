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

export interface GeminiQuota {
  /** Estimated questions left today across all models, shared by all visitors */
  remaining: number;
  /** Gemini has rejected every model for the rest of the day */
  exhausted: boolean;
  /** ISO timestamp of the next daily reset */
  resetsAt: string;
}
