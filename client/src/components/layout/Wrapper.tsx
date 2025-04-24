import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import React from 'react';

interface WrapperProps {
  hasPermission?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Wrapper = ({
  hasPermission = true,
  children,
  className,
}: WrapperProps) => {
  const { t } = useTranslation();

  return (
    <Box
      className={className}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
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
