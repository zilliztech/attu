import { FC, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Chip,
  Stack,
  useTheme,
  TextField,
  Button,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { markdownStyles } from './styles/markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  parts?: Array<{
    type: string;
    text: string;
  }>;
}

const AIChat: FC = () => {
  const { t } = useTranslation('ai');
  const theme = useTheme();
  const apiKey = localStorage.getItem('attu.ui.openai_api_key');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentMessageRef = useRef<Message | null>(null);
  const accumulatedContentRef = useRef('');

  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={theme.palette.mode === 'dark' ? vscDarkPlus : oneLight}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

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
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful AI assistant specialized in Milvus and vector databases. You should only answer questions related to Milvus, vector databases, and vector search. For any other topics, please politely decline to answer and suggest asking about Milvus or vector databases instead.',
            },
            ...messages,
            userMessage,
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Then create EventSource for streaming
      const eventSource = new EventSource(
        `/api/v1/ai/chat?messages=${encodeURIComponent(
          JSON.stringify([
            {
              role: 'system',
              content:
                'You are a helpful AI assistant specialized in Milvus and vector databases. You should only answer questions related to Milvus, vector databases, and vector search. For any other topics, please politely decline to answer and suggest asking about Milvus or vector databases instead.',
            },
            ...messages,
            userMessage,
          ])
        )}&x-openai-api-key=${encodeURIComponent(apiKey || '')}`
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
      sx={{
        height: 'calc(100vh - 45px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: 2,
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
                mb: 2,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  maxWidth: '80%',
                  borderRadius: 2,
                  backgroundColor:
                    message.role === 'user'
                      ? theme.palette.mode === 'dark'
                        ? 'primary.dark'
                        : 'primary.main'
                      : theme.palette.mode === 'dark'
                        ? 'grey.800'
                        : 'white',
                  color:
                    message.role === 'user'
                      ? 'primary.contrastText'
                      : theme.palette.mode === 'dark'
                        ? 'grey.100'
                        : 'text.primary',
                  boxShadow: theme.palette.mode === 'dark' ? 2 : 1,
                  overflow: 'hidden',
                  ...markdownStyles(theme),
                }}
              >
                {message.role === 'assistant' &&
                message.id === currentMessageRef.current?.id ? (
                  <Typography
                    variant="body1"
                    component="div"
                    className="markdown-body"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={components}
                    >
                      {message.content || ''}
                    </ReactMarkdown>
                  </Typography>
                ) : (
                  <Typography
                    variant="body1"
                    component="div"
                    className="markdown-body"
                  >
                    {message.parts?.map((part, index) => {
                      if (part.type === 'text') {
                        return (
                          <ReactMarkdown
                            key={index}
                            remarkPlugins={[remarkGfm]}
                            components={components}
                          >
                            {part.text || ''}
                          </ReactMarkdown>
                        );
                      }
                      return null;
                    }) || (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={components}
                      >
                        {message.content || ''}
                      </ReactMarkdown>
                    )}
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

        {/* <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
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
        </Box> */}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            backgroundColor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <TextField
            value={input}
            onChange={handleInputChange}
            placeholder={t('inputPlaceholder')}
            disabled={isLoading}
            fullWidth
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.default',
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !input.trim()}
            size="small"
          >
            {t('send')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AIChat;
