import { makeStyles } from '@mui/styles';
import { useTranslation } from 'react-i18next';
import type { Theme } from '@mui/material/styles';

interface WrapperProps {
  hasPermission?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  overlay: {
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
  },
  message: {
    fontSize: 14,
    color: theme.palette.text.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}));

const Wrapper = ({
  hasPermission = true,
  children,
  className,
}: WrapperProps) => {
  // styles
  const classes = useStyles();

  // i18n
  const { t: commonTrans } = useTranslation();

  return (
    <div className={`${classes.wrapper} ${className}`}>
      {children}
      {!hasPermission && (
        <div className={classes.overlay}>
          <div className={classes.message}>
            {commonTrans('noPermissionTip')}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wrapper;
