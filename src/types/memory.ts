export interface Memory {
  id: string;
  userId: string;
  content: string;
  type: 'interaction' | 'achievement' | 'emotion' | 'event';
  timestamp: Date;
  importance: number;
  context: Record<string, unknown>;
  embedding?: number[];
}

export interface MemoryQueryResult {
  memory: Memory;
  similarity: number;
}

export interface ShortTermMemory {
  recentInteractions: Memory[];
  currentContext: Record<string, unknown>;
  emotionalState: string;
  activeGoals: string[];
}