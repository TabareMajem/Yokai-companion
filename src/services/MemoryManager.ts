import { Memory, MemoryQueryResult, ShortTermMemory } from '../types/memory';

export class MemoryManager {
  private shortTermMemory: ShortTermMemory = {
    recentInteractions: [],
    currentContext: {},
    emotionalState: 'neutral',
    activeGoals: []
  };

  private readonly SHORT_TERM_MEMORY_LIMIT = 10;

  constructor(
    private userId: string,
    private onMemoryStore: (memory: Memory) => Promise<void>,
    private onMemoryQuery: (query: string, limit: number) => Promise<MemoryQueryResult[]>
  ) {}

  public async storeMemory(
    content: string,
    type: Memory['type'],
    context: Record<string, unknown> = {},
    importance: number = 1
  ): Promise<void> {
    const memory: Memory = {
      id: crypto.randomUUID(),
      userId: this.userId,
      content,
      type,
      timestamp: new Date(),
      importance,
      context
    };

    await this.onMemoryStore(memory);
    this.addToShortTermMemory(memory);
  }

  public async queryRelevantMemories(
    query: string,
    limit: number = 5
  ): Promise<MemoryQueryResult[]> {
    return this.onMemoryQuery(query, limit);
  }

  public updateContext(newContext: Record<string, unknown>): void {
    this.shortTermMemory.currentContext = {
      ...this.shortTermMemory.currentContext,
      ...newContext
    };
  }

  public setEmotionalState(state: string): void {
    this.shortTermMemory.emotionalState = state;
  }

  public setActiveGoals(goals: string[]): void {
    this.shortTermMemory.activeGoals = goals;
  }

  public getShortTermMemory(): ShortTermMemory {
    return { ...this.shortTermMemory };
  }

  private addToShortTermMemory(memory: Memory): void {
    this.shortTermMemory.recentInteractions.unshift(memory);
    
    if (this.shortTermMemory.recentInteractions.length > this.SHORT_TERM_MEMORY_LIMIT) {
      this.shortTermMemory.recentInteractions.pop();
    }
  }
}