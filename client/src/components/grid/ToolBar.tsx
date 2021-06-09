import { FC, useMemo } from 'react';
import {
  Grid,
  Typography,
  makeStyles,
  Theme,
  createStyles,
  IconButton,
} from '@material-ui/core';
import CustomButton from '../customButton/CustomButton';
import Icons from '../icons/Icons';
import { ToolBarConfig, ToolBarType } from './Types';
import SearchInput from '../customInput/SearchInput';
import TableSwitch from './TableSwitch';
import { throwErrorForDev } from '../../utils/Common';
import CustomIconButton from '../customButton/CustomIconButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    countLabel: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      color: theme.palette.common.black,
      opacity: 0.4,
    },
    btn: {
      // marginLeft: theme.spacing(1),
      marginRight: '12px',
    },
    gridEnd: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
  })
);

const CustomToolBar: FC<ToolBarType> = props => {
  const { toolbarConfigs, selected = [] } = props;
  const classes = useStyles();

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
      <Grid container spacing={2}>
        <Grid item xs={8}>
          {leftConfigs.map((c, i) => {
            const isSelect = c.type === 'select' || c.type === 'groupSelect';
            if (isSelect) {
              return c.component;
            }

            const Icon = c.icon ? Icons[c.icon!]() : '';
            const disabled = c.disabled ? c.disabled(selected) : false;
            const isIcon = c.type === 'iconBtn';

            const btn = (
              <CustomButton
                key={i}
                size="small"
                onClick={c.onClick}
                startIcon={Icon}
                color="primary"
                disabled={disabled}
                variant="contained"
                tooltip={c.tooltip}
                className={classes.btn}
              >
                <Typography variant="button">{c.label}</Typography>
              </CustomButton>
            );

            const iconBtn = (
              <CustomIconButton
                key={i}
                onClick={c.onClick}
                tooltip={c.tooltip}
                disabled={disabled}
              >
                {Icon}
              </CustomIconButton>
            );

            return isIcon ? iconBtn : btn;
          })}
        </Grid>

        {rightConfigs.length > 0 && (
          <Grid className={classes.gridEnd} item xs={4}>
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
                    key={i}
                  />
                );
              }
              switch (c.type) {
                case 'switch':
                  if (!c.onAppClick || !c.onListClick) {
                    return throwErrorForDev(
                      `if type is switch need onAppClick onListClick event handler`
                    );
                  }
                  return (
                    <TableSwitch
                      onAppClick={c.onAppClick}
                      onListClick={c.onListClick}
                      key={i}
                    />
                  );
                case 'select':
                case 'groupSelect':
                  if (!c.component) {
                    return throwErrorForDev(`component prop is required`);
                  }
                  return c.component;
                default:
                  const Icon = c.icon ? Icons[c.icon]() : '';
                  return Icon ? (
                    <IconButton onClick={c.onClick} key={i}>
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
