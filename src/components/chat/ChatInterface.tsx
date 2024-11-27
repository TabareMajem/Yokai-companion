import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useYokaiStore } from '../../store/yokaiStore';
import { useAICompanion } from '../../hooks/useAICompanion';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'yokai';
  timestamp: Date;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { yokai } = useYokaiStore();
  const { interact, isProcessing, isReady } = useAICompanion();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing || !yokai || !isReady) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await interact(input, {
        emotionalState: yokai.stats.happiness > 70 ? 'positive' : 'neutral',
        recentMessages: messages.slice(-3)
      });
      
      if (response) {
        const yokaiMessage: Message = {
          id: crypto.randomUUID(),
          content: response,
          sender: 'yokai',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, yokaiMessage]);
      }
    } catch (error) {
      console.error('Error in chat interaction:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'I apologize, but I cannot respond at the moment.',
        sender: 'yokai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <Card className="flex h-[600px] flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="mt-1 block text-xs opacity-75">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            disabled={isProcessing || !isReady}
          />
          <Button type="submit" disabled={isProcessing || !isReady}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </Card>
  );
}