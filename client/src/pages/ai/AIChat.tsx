import { FC, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  useTheme,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import icons from '@/components/icons/Icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { markdownStyles } from './styles/markdown';
import CopyButton from '../../components/advancedSearch/CopyButton';
import { useNavigationHook } from '@/hooks/Navigation';

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
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('attu.ui.chat');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);
  const currentMessageRef = useRef<Message | null>(null);
  const accumulatedContentRef = useRef('');

  useNavigationHook('ai-chat');

  // Generate title from first user message
  useEffect(() => {
    const firstUserMessage = messages.find(m => m.role === 'user')?.content;
    if (firstUserMessage && !title) {
      const generateTitle = async () => {
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
                  content: 'Generate a very short title (max 20 characters) for this question. Only return the title, no other text.',
                },
                {
                  role: 'user',
                  content: firstUserMessage,
                },
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
                  content: 'Generate a very short title (max 20 characters) for this question. Only return the title, no other text.',
                },
                {
                  role: 'user',
                  content: firstUserMessage,
                },
              ])
            )}&x-openai-api-key=${encodeURIComponent(apiKey || '')}`
          );

          let accumulatedTitle = '';
          eventSource.onmessage = event => {
            if (event.data === '[DONE]') {
              eventSource.close();
              return;
            }

            try {
              const data = JSON.parse(event.data);
              if (data.value?.parts?.[0]?.text) {
                accumulatedTitle += data.value.parts[0].text;
                setTitle(accumulatedTitle.trim());
              }
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          };

          eventSource.onerror = error => {
            console.error('EventSource error:', error);
            eventSource.close();
          };
        } catch (error) {
          console.error('Error generating title:', error);
        }
      };

      generateTitle();
    }
  }, [messages, title, apiKey]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('attu.ui.chat', JSON.stringify(messages));
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    setTitle('');
    localStorage.removeItem('attu.ui.chat');
  };

  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CopyButton
              copyValue={String(children).replace(/\n$/, '')}
              tooltipPlacement="top"
              sx={{
                color: 'text.secondary',
                '& svg': {
                  fontSize: 14,
                },
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'text.primary',
                },
              }}
            />
          </Box>
          <SyntaxHighlighter
            style={theme.palette.mode === 'dark' ? vscDarkPlus : oneLight}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </Box>
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
        backgroundColor: 'background.paper',
        color: 'text.primary',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          maxWidth: 800,
          width: '100%',
          mx: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              maxWidth: 'calc(100% - 40px)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title || t('aiChat')}
          </Typography>
          <Tooltip title={t('clearChat')}>
            <IconButton
              onClick={handleClearChat}
              disabled={messages.length === 0 || isLoading}
              size="small"
            >
              <icons.cross sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
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
                width: '100%',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  maxWidth: '75%',
                  borderRadius: 2,
                  backgroundColor:
                    message.role === 'user'
                      ? theme.palette.mode === 'dark'
                        ? 'primary.dark'
                        : 'primary.light'
                      : 'transparent',
                  color:
                    message.role === 'user'
                      ? 'primary.contrastText'
                      : 'text.primary',
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
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  mt: 0.5,
                  width: '75%',
                }}
              >
                <CopyButton
                  copyValue={message.content}
                  tooltipPlacement="top"
                  sx={{
                    color: 'text.secondary',
                    '& svg': {
                      fontSize: 14,
                    },
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: 'text.primary',
                    },
                  }}
                />
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
