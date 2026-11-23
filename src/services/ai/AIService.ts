import type { AssistantMode } from '@/types';

export interface AIRequest {
  prompt: string;
  mode: AssistantMode;
  subjectName?: string;
}

export interface AIResponse {
  text: string;
  /** true бол жинхэнэ AI биш, туршилтын (mock) хариулт */
  isMock: boolean;
}

/**
 * AI туслахын interface.
 * Одоогоор MockAIService хэрэгжүүлсэн. Бодит API (OpenAI, Gemini, Claude г.м.) холбохдоо
 * энэ interface-ийг хэрэгжүүлсэн шинэ класс бичээд services/ai/index.ts дахь export-ыг солиход хангалттай.
 */
export interface AIService {
  ask(req: AIRequest): Promise<AIResponse>;
}
