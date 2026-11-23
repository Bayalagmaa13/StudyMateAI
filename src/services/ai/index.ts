import type { AIService } from './AIService';
import { MockAIService } from './MockAIService';

// Бодит API холбохдоо зөвхөн энэ мөрийг солино: export const aiService: AIService = new RealAIService();
export const aiService: AIService = new MockAIService();

export type { AIRequest, AIResponse, AIService } from './AIService';
