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

  return tooltip ? (
    <Tooltip title={tooltip} placement={tooltipPlacement}>
      {disabled ? <span>{button}</span> : button}
    </Tooltip>
  ) : (
    button
  );
};

export default CustomButton;
