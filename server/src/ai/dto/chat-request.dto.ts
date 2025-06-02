export class ChatRequestDto {
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}