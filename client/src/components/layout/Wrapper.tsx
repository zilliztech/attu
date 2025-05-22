import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import React from 'react';

import type { SxProps, Theme } from '@mui/material';

interface WrapperProps {
  hasPermission?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
}

const Wrapper = ({
  hasPermission = true,
  children,
  className,
  style,
  sx,
}: WrapperProps) => {
  const { t } = useTranslation();

  return (
    <Box
      className={className}
      style={style}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...((Array.isArray(sx) ? Object.assign({}, ...sx) : sx) || {}),
      }}
    >
      {children}
      {!hasPermission && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            zIndex: 1000,
          }}
        >
          <Box
            sx={{
              fontSize: 14,
              color: 'text.primary',
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            {t('noPermissionTip')}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Wrapper;
