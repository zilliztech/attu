import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import type { ButtonProps } from '@mui/material/Button';

interface CustomButtonProps extends ButtonProps {
  tooltip?: string;
  tooltipPlacement?:
    | 'bottom'
    | 'left'
    | 'right'
    | 'top'
    | 'bottom-end'
    | 'bottom-start'
    | 'left-end'
    | 'left-start'
    | 'right-end'
    | 'right-start'
    | 'top-end'
    | 'top-start';
}

const CustomButton = ({
  tooltip,
  tooltipPlacement = 'top',
  disabled,
  ...props
}: CustomButtonProps) => {
  const button = <Button disabled={disabled} {...props} />;
  if (!tooltip) return button;
  return (
    <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
      <span style={{ display: 'inline-block' }}>{button}</span>
    </Tooltip>
  );
};

export default CustomButton;
