export interface MessageDto {
  role: string;
  content: string;
}

export interface ChatRequestDto {
  messages: MessageDto[];
}

export function validateChatRequest(data: any): data is ChatRequestDto {
  if (!data || !Array.isArray(data.messages)) {
    return false;
  }

  return data.messages.every((message: any) => {
    return (
      message &&
      typeof message.role === 'string' &&
      typeof message.content === 'string'
    );
  });
}