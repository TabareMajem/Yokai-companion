import { create } from 'zustand';
import { YokaiProfile, Stats, Trait, EvolutionStage } from '../types/yokai';
import { ChatManager } from '../services/ChatManager';
import { PersonalityManager } from '../services/PersonalityManager';
import { MemoryManager } from '../services/MemoryManager';

interface YokaiState {
  yokai: YokaiProfile | null;
  chatManager: ChatManager | null;
  personalityManager: PersonalityManager | null;
  memoryManager: MemoryManager | null;
  isLoading: boolean;
  error: string | null;
  initializeYokai: (profile: YokaiProfile) => void;
  updateStats: (newStats: Partial<Stats>) => void;
  addTrait: (trait: Trait) => void;
  evolve: (newStage: EvolutionStage) => void;
  updateRelationship: (level: number) => void;
}

export const useYokaiStore = create<YokaiState>((set, get) => ({
  yokai: null,
  chatManager: null,
  personalityManager: null,
  memoryManager: null,
  isLoading: false,
  error: null,

  initializeYokai: (profile) => {
    const memoryManager = new MemoryManager(
      profile.id,
      async (memory) => {
        // Implement memory storage
        console.log('Storing memory:', memory);
      },
      async (query, limit) => {
        // Implement memory query
        console.log('Querying memories:', query, limit);
        return [];
      }
    );

    const personalityManager = new PersonalityManager(profile, memoryManager);
    
    const chatManager = new ChatManager(
      personalityManager,
      memoryManager,
      profile
    );

    set({
      yokai: profile,
      chatManager,
      personalityManager,
      memoryManager,
    });
  },

  updateStats: (newStats) =>
    set((state) => ({
      yokai: state.yokai
        ? {
            ...state.yokai,
            stats: { ...state.yokai.stats, ...newStats },
          }
        : null,
    })),

  addTrait: (trait) =>
    set((state) => ({
      yokai: state.yokai
        ? {
            ...state.yokai,
            traits: [...state.yokai.traits, trait],
          }
        : null,
    })),

  evolve: (newStage) =>
    set((state) => ({
      yokai: state.yokai
        ? {
            ...state.yokai,
            evolutionStage: newStage,
          }
        : null,
    })),

  updateRelationship: (level) =>
    set((state) => ({
      yokai: state.yokai
        ? {
            ...state.yokai,
            relationshipLevel: level,
          }
        : null,
    })),
}));