import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { useChat } from '@ai-sdk/react';

const AIChat: FC = () => {
  const { t } = useTranslation('ai');
  const apiKey = localStorage.getItem('attu.ui.openai_api_key');

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/v1/ai/chat',
      headers: {
        'x-openai-api-key': apiKey || '',
      },
      onError: (error: Error) => {
        console.error('Chat error:', error);
      },
    });

  const suggestedCommands = [
    t('suggestions.search'),
    t('suggestions.create'),
    t('suggestions.delete'),
    t('suggestions.insert'),
  ];

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
              <Typography variant="body1">
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return <span key={index}>{part.text}</span>;
                  }
                  return null;
                })}
              </Typography>
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
              onClick={() =>
                handleInputChange({ target: { value: command } } as any)
              }
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
