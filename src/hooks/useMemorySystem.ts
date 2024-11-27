import { useState, useCallback } from 'react';
import { EnhancedMemoryManager } from '../services/EnhancedMemoryManager';
import { Memory, MemoryQueryResult } from '../types/memory';
import { useYokaiStore } from '../store/yokaiStore';

export function useMemorySystem() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { yokai } = useYokaiStore();
  const [memoryManager, setMemoryManager] = useState<EnhancedMemoryManager | null>(null);

  const initialize = useCallback(async () => {
    if (!yokai || isInitialized) return;

    setIsLoading(true);
    try {
      const manager = new EnhancedMemoryManager(
        yokai.id,
        `yokai-${yokai.id}`
      );
      await manager.initialize();
      setMemoryManager(manager);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing memory system:', error);
    } finally {
      setIsLoading(false);
    }
  }, [yokai, isInitialized]);

  const storeMemory = useCallback(async (
    content: string,
    type: Memory['type'],
    context: Record<string, unknown> = {},
    importance: number = 1
  ) => {
    if (!memoryManager) return;

    const memory: Memory = {
      id: crypto.randomUUID(),
      userId: yokai!.id,
      content,
      type,
      timestamp: new Date(),
      importance,
      context
    };

    try {
      await memoryManager.storeMemory(memory);
      return memory;
    } catch (error) {
      console.error('Error storing memory:', error);
    }
  }, [memoryManager, yokai]);

  const queryMemories = useCallback(async (
    query: string,
    limit?: number
  ): Promise<MemoryQueryResult[]> => {
    if (!memoryManager) return [];

    try {
      return await memoryManager.queryMemories(query, limit);
    } catch (error) {
      console.error('Error querying memories:', error);
      return [];
    }
  }, [memoryManager]);

  const getMemorySummary = useCallback(async (): Promise<string> => {
    if (!memoryManager) return '';

    try {
      return await memoryManager.getSummary();
    } catch (error) {
      console.error('Error getting memory summary:', error);
      return '';
    }
  }, [memoryManager]);

  return {
    isInitialized,
    isLoading,
    initialize,
    storeMemory,
    queryMemories,
    getMemorySummary
  };
}