import { FC, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CustomButton from '../customButton/CustomButton';
import Icons from '../icons/Icons';
import SearchInput from '../customInput/SearchInput';
import { throwErrorForDev } from '../../utils/Common';
import CustomIconButton from '../customButton/CustomIconButton';
import type { ToolBarConfig, ToolBarType } from './Types';

const CustomToolBar: FC<ToolBarType> = props => {
  const { toolbarConfigs, selected = [], hideOnDisable = false } = props;

  // remove hidden button
  const leftConfigs = useMemo(() => {
    return toolbarConfigs.filter(
      (c: ToolBarConfig) =>
        !c.hidden &&
        c.icon !== 'search' &&
        c.type !== 'switch' &&
        c.position !== 'right'
    );
  }, [toolbarConfigs]);

  const rightConfigs = useMemo(() => {
    return toolbarConfigs.filter(
      c => c.icon === 'search' || c.type === 'switch' || c.position === 'right'
    );
  }, [toolbarConfigs]);

  return (
    <>
      <Grid
        container
        role="toolbar"
        sx={theme => ({ marginBottom: theme.spacing(1) })}
      >
        <Grid item xs={10}>
          {leftConfigs.map((c, i) => {
            const isSelect = c.type === 'select' || c.type === 'groupSelect';
            if (isSelect) {
              return c.component;
            }

            const Icon = c.icon ? Icons[c.icon!]() : '';
            const disabled = c.disabled ? c.disabled(selected) : false;

            if (
              disabled && // Check if the component is disabled
              hideOnDisable && // Check if the component should be hidden when disabled
              !c.alwaysShow && // Check if the button is not marked to always be shown
              (typeof c.hideOnDisable === 'undefined' || c.hideOnDisable()) // Check if hideOnDisable on button is undefined or returns true
            ) {
              return null; // Return null to hide the component
            }

            // when disabled "disabledTooltip" will replace "tooltip"
            const tooltip =
              disabled && c.disabledTooltip ? c.disabledTooltip : c.tooltip;
            const isIcon = c.type === 'iconBtn';

            const btn = (
              <CustomButton
                key={i}
                size="small"
                onClick={c.onClick}
                startIcon={Icon}
                color={c.btnColor || 'primary'}
                disabled={disabled}
                // use contained variant as default
                variant={c.btnVariant || 'contained'}
                tooltip={tooltip}
                sx={theme => ({
                  marginRight: theme.spacing(0.5),
                  p: theme.spacing(1),
                })}
                role="button"
              >
                <Typography variant="button" sx={{ fontSize: 13 }}>
                  {c.label}
                </Typography>
              </CustomButton>
            );

            const iconBtn = (
              <CustomIconButton
                key={i}
                onClick={c.onClick}
                tooltip={tooltip}
                disabled={disabled}
                role="button"
              >
                {Icon}
              </CustomIconButton>
            );

            return isIcon ? iconBtn : btn;
          })}
        </Grid>

        {rightConfigs.length > 0 && (
          <Grid
            item
            xs={2}
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            {rightConfigs.map((c, i) => {
              if (c.icon === 'search') {
                if (!c.onSearch) {
                  return throwErrorForDev(
                    `if icon is search  onSearch event handler is required`
                  );
                }
                return (
                  <SearchInput
                    onClear={c.onClear}
                    onSearch={c.onSearch}
                    searchText={c.searchText}
                    placeholder={c.placeholder}
                    key={i}
                  />
                );
              }
              switch (c.type) {
                case 'select':
                case 'groupSelect':
                  if (!c.component) {
                    return throwErrorForDev(`component prop is required`);
                  }
                  return c.component;
                default:
                  const Icon = c.icon ? Icons[c.icon]() : '';
                  return Icon ? (
                    <IconButton onClick={c.onClick} key={i} size="large">
                      {Icon}
                    </IconButton>
                  ) : (
                    <div key={i}>Need Icon</div>
                  );
              }
            })}
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default CustomToolBar;
