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
    this.router.post('/chat', this.handleChat.bind(this));
    return this.router;
  }

  async handleChat(
    req: Request<{}, {}, ChatRequestDto>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const apiKey = req.headers['x-openai-api-key'] as string;
      if (!apiKey) {
        return res.status(400).json({
          error: 'API key is required',
        });
      }

      await this.aiService.chat(req.body, res, apiKey);
    } catch (error) {
      next(error);
    }
  }
}