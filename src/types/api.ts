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

