import { FC, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Chip, Stack } from '@mui/material';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  parts?: Array<{
    type: string;
    text: string;
  }>;
}

const AIChat: FC = () => {
  const { t } = useTranslation('ai');
  const apiKey = localStorage.getItem('attu.ui.openai_api_key');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentMessageRef = useRef<Message | null>(null);
  const accumulatedContentRef = useRef('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    accumulatedContentRef.current = ''; // Reset accumulated content

    // Close existing EventSource if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      // First, send the initial request with headers
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-openai-api-key': apiKey || '',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Then create EventSource for streaming
      const eventSource = new EventSource(
        `/api/v1/ai/chat?messages=${encodeURIComponent(JSON.stringify([...messages, userMessage]))}&x-openai-api-key=${encodeURIComponent(apiKey || '')}`
      );
      eventSourceRef.current = eventSource;

      // Initialize current message
      const messageId = `msg_${Date.now()}`;
      currentMessageRef.current = {
        id: messageId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        parts: [
          {
            type: 'text',
            text: '',
          },
        ],
      };

      // Add initial empty message to the list
      setMessages(prev => [...prev, { ...currentMessageRef.current! }]);

      // Handle messages
      eventSource.onmessage = event => {
        if (event.data === '[DONE]') {
          // console.log('Stream completed');
          eventSource.close();
          setIsLoading(false);
          return;
        }

        try {
          const data = JSON.parse(event.data);
          // console.log('Received message:', data);
          if (data.value) {
            const newContent = data.value.parts[0].text;
            // console.log('New content:', newContent);

            // Accumulate content
            accumulatedContentRef.current += newContent;

            setMessages(prev => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage && lastMessage.id === messageId) {
                return newMessages.map(msg =>
                  msg.id === messageId
                    ? {
                        ...msg,
                        content: accumulatedContentRef.current,
                        parts: [
                          {
                            type: 'text',
                            text: accumulatedContentRef.current,
                          },
                        ],
                      }
                    : msg
                );
              }
              return newMessages;
            });
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      // Handle errors
      eventSource.onerror = error => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Error:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const suggestedCommands = [
    t('suggestions.search'),
    t('suggestions.create'),
    t('suggestions.delete'),
    t('suggestions.insert'),
  ];

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">{t('title')}</Typography>
        <Chip label={t('status.connected')} color="success" size="small" />
      </Stack>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 2,
          overflowY: 'auto',
        }}
      >
        {messages.map(message => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                p: 2,
                maxWidth: '80%',
                borderRadius: 2,
                backgroundColor:
                  message.role === 'user' ? 'primary.main' : 'background.paper',
                color:
                  message.role === 'user'
                    ? 'primary.contrastText'
                    : 'text.primary',
                boxShadow: 1,
              }}
            >
              {message.role === 'assistant' &&
              message.id === currentMessageRef.current?.id ? (
                <Typography variant="body1">{message.content || ''}</Typography>
              ) : (
                <Typography variant="body1">
                  {message.parts?.map((part, index) => {
                    if (part.type === 'text') {
                      return <span key={index}>{part.text || ''}</span>;
                    }
                    return null;
                  }) ||
                    message.content ||
                    ''}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('status.thinking')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Suggested Commands */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t('suggestions.title')}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {suggestedCommands.map((command, index) => (
            <Chip
              key={index}
              label={command}
              onClick={() => setInput(command)}
              sx={{ mb: 1 }}
            />
          ))}
        </Stack>
      </Box>

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder={t('inputPlaceholder')}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'var(--mui-palette-background-default)',
            color: 'var(--mui-palette-text-primary)',
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--mui-palette-primary-main)',
            color: 'var(--mui-palette-primary-contrastText)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
          }}
        >
          {t('send')}
        </button>
      </Box>
    </Box>
  );
};

export default AIChat;
