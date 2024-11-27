import { z } from 'zod';

const configSchema = z.object({
  openaiApiKey: z.string().min(1),
  pineconeApiKey: z.string().min(1),
  pineconeIndex: z.string().min(1),
  dangerouslyAllowBrowser: z.literal(true)
});

export type AIConfig = z.infer<typeof configSchema>;

export function getAIConfig(): AIConfig {
  const config = {
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
    pineconeApiKey: import.meta.env.VITE_PINECONE_API_KEY,
    pineconeIndex: import.meta.env.VITE_PINECONE_INDEX,
    dangerouslyAllowBrowser: true
  };

  try {
    return configSchema.parse(config);
  } catch (error) {
    console.error('Configuration error:', error);
    throw new Error('Missing required API keys. Please check your environment configuration.');
  }
}