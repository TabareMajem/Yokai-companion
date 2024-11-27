import { PineconeStore } from '@langchain/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import { ConversationSummaryMemory, BufferMemory } from 'langchain/memory';
import { ChatOpenAI } from '@langchain/openai';
import { Memory, MemoryQueryResult } from '../types/memory';
import { getConfig } from '../config/openai';

export class EnhancedMemoryManager {
  private vectorStore: PineconeStore;
  private summaryMemory: ConversationSummaryMemory;
  private shortTermMemory: BufferMemory;
  private embeddings: OpenAIEmbeddings;

  constructor(
    private userId: string,
    private namespace: string
  ) {
    const config = getConfig();
    
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openaiApiKey,
      modelName: 'text-embedding-3-small'
    });

    this.summaryMemory = new ConversationSummaryMemory({
      llm: new ChatOpenAI({
        modelName: 'gpt-4',
        openAIApiKey: config.openaiApiKey,
        temperature: 0
      }),
      returnMessages: true
    });

    this.shortTermMemory = new BufferMemory({
      memoryKey: 'chat_history',
      returnMessages: true
    });
  }

  public async initialize(): Promise<void> {
    try {
      this.vectorStore = await PineconeStore.fromExistingIndex(
        this.embeddings,
        {
          pineconeIndex: process.env.PINECONE_INDEX!,
          namespace: this.namespace
        }
      );
    } catch (error) {
      console.error('Error initializing vector store:', error);
      throw new Error('Failed to initialize memory system');
    }
  }

  public async storeMemory(memory: Memory): Promise<void> {
    try {
      // Generate embedding and store in vector database
      await this.vectorStore.addDocuments([{
        pageContent: memory.content,
        metadata: {
          userId: this.userId,
          type: memory.type,
          timestamp: memory.timestamp.toISOString(),
          importance: memory.importance,
          ...memory.context
        }
      }]);

      // Update conversation memory
      await this.shortTermMemory.saveContext(
        { input: memory.content },
        { output: 'Memory stored successfully' }
      );

      // Update summary memory if it's an important memory
      if (memory.importance >= 8) {
        await this.summaryMemory.saveContext(
          { input: memory.content },
          { output: `Important memory: ${memory.content}` }
        );
      }
    } catch (error) {
      console.error('Error storing memory:', error);
      throw new Error('Failed to store memory');
    }
  }

  public async queryMemories(
    query: string,
    limit: number = 5
  ): Promise<MemoryQueryResult[]> {
    try {
      const results = await this.vectorStore.similaritySearch(query, limit);
      
      return results.map(doc => ({
        memory: {
          id: doc.metadata.id || crypto.randomUUID(),
          userId: doc.metadata.userId,
          content: doc.pageContent,
          type: doc.metadata.type,
          timestamp: new Date(doc.metadata.timestamp),
          importance: doc.metadata.importance,
          context: doc.metadata
        },
        similarity: doc.metadata.score || 0
      }));
    } catch (error) {
      console.error('Error querying memories:', error);
      throw new Error('Failed to query memories');
    }
  }

  public async getSummary(): Promise<string> {
    try {
      const summary = await this.summaryMemory.loadMemoryVariables({});
      return summary.history || '';
    } catch (error) {
      console.error('Error getting memory summary:', error);
      throw new Error('Failed to get memory summary');
    }
  }

  public async getRecentContext(): Promise<string> {
    try {
      const context = await this.shortTermMemory.loadMemoryVariables({});
      return context.chat_history || '';
    } catch (error) {
      console.error('Error getting recent context:', error);
      throw new Error('Failed to get recent context');
    }
  }

  public async searchByTimeRange(
    startDate: Date,
    endDate: Date,
    type?: string
  ): Promise<Memory[]> {
    try {
      const filter = {
        timestamp: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString()
        },
        ...(type && { type })
      };

      const results = await this.vectorStore.similaritySearch(
        '',
        100,
        filter
      );

      return results.map(doc => ({
        id: doc.metadata.id || crypto.randomUUID(),
        userId: doc.metadata.userId,
        content: doc.pageContent,
        type: doc.metadata.type,
        timestamp: new Date(doc.metadata.timestamp),
        importance: doc.metadata.importance,
        context: doc.metadata
      }));
    } catch (error) {
      console.error('Error searching memories by time range:', error);
      throw new Error('Failed to search memories');
    }
  }

  public async clearOldMemories(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await this.vectorStore.delete({
        filter: {
          timestamp: {
            $lt: cutoffDate.toISOString()
          },
          importance: {
            $lt: 7 // Keep important memories longer
          }
        }
      });
    } catch (error) {
      console.error('Error clearing old memories:', error);
      throw new Error('Failed to clear old memories');
    }
  }
}