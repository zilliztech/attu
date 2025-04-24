import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import type { IconButtonProps } from '@mui/material/IconButton';

interface CustomIconButtonProps extends IconButtonProps {
  tooltip?: string;
  className?: string;
}

const CustomIconButton = ({
  tooltip,
  className = '',
  children,
  ...otherProps
}: CustomIconButtonProps) => {
  const iconBtn = (
    <IconButton sx={{ p: 0.5 }} className={className} {...otherProps}>
      {children}
    </IconButton>
  );

  if (!tooltip) return iconBtn;

  return (
    <Tooltip title={tooltip} arrow>
      <span style={{ display: 'inline-block' }}>{iconBtn}</span>
    </Tooltip>
  );
};

export default CustomIconButton;
