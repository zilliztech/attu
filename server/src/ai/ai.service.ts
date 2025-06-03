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

      // Initialize OpenAI client with DeepSeek configuration
      this.openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: apiKey,
      });

      const stream = await this.openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: chatRequest.messages,
        stream: true,
        max_tokens: 4096, // Default max output tokens for deepseek-chat
      });

      // Set headers for SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Transfer-Encoding': 'chunked',
      });

      let messageId = `msg_${Date.now()}`;

      // Handle the stream
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          // Send each chunk immediately without accumulation
          const message = {
            id: messageId,
            role: 'assistant',
            content: content,
            createdAt: new Date().toISOString(),
            parts: [
              {
                type: 'text',
                text: content,
              },
            ],
          };

          // Flush the response immediately
          const data = JSON.stringify({
            type: 'text',
            value: message,
          });
          res.write(`data: ${data}\n\n`);
          res.flush?.(); // Flush if available
        }
      }

      // Send the final message
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('DeepSeek API error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error:
            error instanceof Error
              ? error.message
              : 'Failed to get response from DeepSeek',
        });
      }
    }
  }
}
