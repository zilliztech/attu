import OpenAI from 'openai';
import { ChatRequestDto } from './dto/chat-request.dto';
import { Response } from 'express';

export class AIService {
  private openai: OpenAI | null = null;

  async chat(chatRequest: ChatRequestDto, res: Response, apiKey: string) {
    try {
      if (!apiKey) {
        throw new Error('API key is required');
      }

      // Initialize OpenAI client only when needed
      this.openai = new OpenAI({
        apiKey,
      });

      const stream = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: chatRequest.messages,
        stream: true,
      });

      // Set headers for streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Handle the stream
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('OpenAI API error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: error instanceof Error ? error.message : 'Failed to get response from OpenAI',
        });
      }
    }
  }
}