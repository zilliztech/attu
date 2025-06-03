import { NextFunction, Request, Response, Router } from 'express';
import { AIService } from './ai.service';
import { ChatRequestDto } from './dto/chat-request.dto';

export class AIController {
  private aiService: AIService;
  private router: Router;

  constructor() {
    this.aiService = new AIService();
    this.router = Router();
  }

  generateRoutes() {
    // Handle preflight requests
    this.router.options('/chat', (req, res) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, x-openai-api-key'
      );
      res.status(204).end();
    });

    this.router.post('/chat', this.handleChat.bind(this));
    this.router.get('/chat', this.handleChat.bind(this));
    return this.router;
  }

  async handleChat(
    req: Request<{}, {}, ChatRequestDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      // Get API key from either headers or query parameters
      const apiKey =
        (req.headers['x-openai-api-key'] as string) ||
        (req.query['x-openai-api-key'] as string);
      if (!apiKey) {
        return res.status(400).json({
          error: 'API key is required',
        });
      }

      // Set CORS headers for SSE
      res.header('Access-Control-Allow-Origin', '*');
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, x-openai-api-key'
      );
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

      // Get messages from either body (POST) or query (GET)
      const messages =
        req.method === 'POST'
          ? req.body.messages
          : JSON.parse(req.query.messages as string);

      await this.aiService.chat({ messages }, res, apiKey);
    } catch (error) {
      next(error);
    }
  }
}
