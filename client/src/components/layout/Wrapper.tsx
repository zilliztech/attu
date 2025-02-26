import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';

interface WrapperProps {
  hasPermission?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const WrapperRoot = styled('div')({
  width: '100%',
  height: '100%',
  position: 'relative',
});

const Overlay = styled('div')(({ theme }: { theme: Theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  zIndex: 1000,
}));

const Message = styled('div')(({ theme }: { theme: Theme }) => ({
  fontSize: 14,
  color: theme.palette.text.primary,
  textAlign: 'center',
  fontStyle: 'italic',
}));

const Wrapper = ({
  hasPermission = true,
  children,
  className,
}: WrapperProps) => {
  // i18n
  const { t: commonTrans } = useTranslation();

  return (
    <WrapperRoot className={className}>
      {children}
      {!hasPermission && (
        <Overlay>
          <Message>{commonTrans('noPermissionTip')}</Message>
        </Overlay>
      )}
    </WrapperRoot>
  );
};

export default Wrapper;
