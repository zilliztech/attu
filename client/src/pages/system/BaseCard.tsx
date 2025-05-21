import { FC } from 'react';
import { SvgIcon, Box, useTheme } from '@mui/material';
import { BaseCardProps } from './Types';
import pic from '../../assets/imgs/pic.svg?react';

const BaseCard: FC<BaseCardProps> = props => {
  const theme = useTheme();
  const { children, title, content, desc } = props;
  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxSizing: 'border-box',
        height: '150px',
        padding: theme.spacing(2),
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <Box
        sx={{
          color: theme.palette.text.secondary,
          fontSize: '14px',
          marginBottom: '5px',
          textTransform: 'capitalize',
        }}
      >
        {title}
      </Box>
      {content && (
        <Box
          component="span"
          sx={{
            color: theme.palette.text.primary,
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: '36px',
          }}
        >
          {content}
        </Box>
      )}
      {desc && (
        <Box
          component="span"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: '14px',
            lineHeight: '36px',
            marginLeft: theme.spacing(1),
          }}
        >
          {desc}
        </Box>
      )}
      {!content && !desc && (
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            width: '100%',
            mt: 1,
          }}
        >
          <SvgIcon
            viewBox="0 0 101 26"
            component={pic}
            sx={{ mt: '10px', width: '100%' }}
            {...props}
          />
          <Box
            sx={{
              fontSize: '14px',
              marginTop: '14px',
              textTransform: 'capitalize',
            }}
          >
            no data available
          </Box>
          <Box
            sx={{
              fontSize: '10px',
              color: theme.palette.text.secondary,
              marginTop: theme.spacing(1),
            }}
          >
            There is no data to show you right now.
          </Box>
        </Box>
      )}
      {children}
    </Box>
  );
};

export default BaseCard;
