import { ChatRepository } from '../repositories/ChatRepository.js';
import { IChatMessage } from '../models/ChatHistory.js';
import { AzureOpenAI } from 'openai';
import { SearchClient, AzureKeyCredential } from '@azure/search-documents';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// A local fitness knowledge base for the RAG search fallback
const FITNESS_KNOWLEDGE_BASE = [
  {
    keywords: ['squat', 'form', 'knee', 'pain'],
    content: 'When squatting, ensure your knees align with your toes and do not cave inward. Keep your heels firmly on the ground, chest up, and core engaged. Initiate the movement by pushing your hips back as if sitting in a chair. Squat to parallel or lower if flexibility permits.'
  },
  {
    keywords: ['deadlift', 'back', 'pain', 'spine'],
    content: 'For a safe deadlift, maintain a neutral spine throughout the lift. Do not round your lower back. Position the barbell over the mid-foot, grip the bar, pull your shoulder blades back and down, and drive through your legs. Keep the bar close to your shins.'
  },
  {
    keywords: ['bench press', 'shoulder', 'elbow'],
    content: 'On the bench press, keep your feet flat on the floor, pull your shoulder blades together to create a solid arch, and tuck your elbows at roughly a 45-degree angle. Touch the bar to your lower sternum, and press straight up while exhaling.'
  },
  {
    keywords: ['protein', 'how much', 'muscle'],
    content: 'For muscle hypertrophy, target 1.6 to 2.2 grams of protein per kilogram of body weight (0.8 to 1.0g per lb). Distribute protein intake across 3-5 meals daily, focusing on high-quality sources like chicken, lean beef, fish, eggs, tofu, or whey protein.'
  },
  {
    keywords: ['weight loss', 'deficit', 'cardio'],
    content: 'Weight loss requires a caloric deficit. Focus on consuming high-protein and high-fiber foods to stay full. Incorporate resistance training to preserve lean muscle, and supplement with cardio (HIIT or LISS) to increase energy expenditure.'
  },
  {
    keywords: ['recovery', 'doms', 'sore'],
    content: 'To optimize recovery and alleviate DOMS (Delayed Onset Muscle Soreness), prioritize 7-9 hours of quality sleep, stay hydrated, consume adequate protein and carbohydrates post-workout, and execute active recovery such as walking, stretching, or foam rolling.'
  }
];

export class ChatService {
  private chatRepository = new ChatRepository();

  async getChatHistory(userId: string): Promise<IChatMessage[]> {
    return this.chatRepository.getHistory(userId);
  }

  async clearHistory(userId: string): Promise<void> {
    await this.chatRepository.clearHistory(userId);
  }

  async askCoach(userId: string, userMessage: string): Promise<IChatMessage> {
    logger.info(`Processing chat message from user ${userId}`);

    // 1. Save user message to history
    await this.chatRepository.saveMessage(userId, 'user', userMessage);

    // 2. Search knowledge base (RAG mock via Azure AI Search)
    let context = '';
    if (process.env.AZURE_AI_SEARCH_ENDPOINT && process.env.AZURE_AI_SEARCH_KEY) {
      logger.info('Performing semantic search query on Azure AI Search index...');
      try {
        const searchClient = new SearchClient(
          process.env.AZURE_AI_SEARCH_ENDPOINT,
          'fitness-knowledge-base',
          new AzureKeyCredential(process.env.AZURE_AI_SEARCH_KEY)
        );
        const searchResults = await searchClient.search(userMessage, { top: 3 });
        const docs = [];
        for await (const result of searchResults.results) {
          const doc = result.document as any;
          if (doc.title && doc.content) {
            docs.push(`Title: ${doc.title}\nContent: ${doc.content}`);
          }
        }
        context = docs.join('\n\n');
      } catch (err: any) {
        logger.error(`Azure Search error: ${err.message}. Falling back to local KB.`);
        context = this.searchLocalKnowledgeBase(userMessage);
      }
    } else {
      context = this.searchLocalKnowledgeBase(userMessage);
    }

    // 3. Request completion (Azure AI Foundry chat completion mock)
    let reply = '';
    if (process.env.AZURE_AI_FOUNDRY_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
      logger.info('Requesting completion from Azure AI Foundry model endpoint...');
      try {
        const client = new AzureOpenAI({
          endpoint: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
          apiKey: process.env.AZURE_OPENAI_API_KEY,
          apiVersion: "2024-05-01-preview"
        });
        const result = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: `You are an expert fitness coach AI. Use this context if helpful to answer the user's question: ${context}` },
            { role: 'user', content: userMessage }
          ]
        });
        reply = result.choices[0].message?.content || 'Sorry, I could not generate a response.';
      } catch (err: any) {
        logger.error(`Error calling Azure OpenAI: ${err.message}`);
        reply = this.generateFallbackCoachReply(userMessage, context);
      }
    } else {
      reply = this.generateFallbackCoachReply(userMessage, context);
    }

    // 4. Save coach reply to history and return
    return this.chatRepository.saveMessage(userId, 'assistant', reply);
  }

  private searchLocalKnowledgeBase(query: string): string {
    const lowerQuery = query.toLowerCase();
    const matches = FITNESS_KNOWLEDGE_BASE.filter(item =>
      item.keywords.some(keyword => lowerQuery.includes(keyword))
    );

    if (matches.length > 0) {
      return matches.map(m => m.content).join('\n\n');
    }
    return '';
  }

  private generateFallbackCoachReply(message: string, context: string): string {
    const greetings = ['hi', 'hello', 'hey', 'coach', 'bodygpt'];
    const lowerMsg = message.toLowerCase();

    if (greetings.some(g => lowerMsg === g || lowerMsg.startsWith(g + ' '))) {
      return "Hello! I am your AI Fitness Coach, BodyGPT. I'm here to help you design workout plans, customize your macros, check your exercise posture, or answer any nutritional questions. What are we focusing on today?";
    }

    if (context) {
      return `Based on our fitness database: ${context}\n\nIs there anything specific about this you'd like me to detail further?`;
    }

    return "That's a great question. To give you the best advice, could you share a bit more context? For example, are you working out at home or in a gym, and what is your primary fitness goal (weight loss, muscle gain, etc.)? Let me know so I can tailor the instructions!";
  }
}
