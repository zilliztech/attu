import { FC, useMemo, MouseEvent } from 'react';
import { StatusActionType } from '@/components/status/Types';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  Theme,
  createStyles,
  Typography,
  useTheme,
  Chip,
} from '@material-ui/core';
import { LOADING_STATE } from '@/consts';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      alignItems: 'center',
    },
    chip: {
      border: 'none',
      background: `rgba(0, 0, 0, 0.04)`,
      marginRight: theme.spacing(0.5),
      paddingLeft: theme.spacing(0.5),
    },
    circle: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
    },
    loaded: {
      border: `1px solid ${theme.palette.primary.main}`,
      backgroundColor: theme.palette.primary.main,
    },
    unloaded: {
      border: `1px solid ${theme.palette.primary.main}`,
      background: '#fff !important',
    },
    noIndex: {
      border: `1px solid ${theme.palette.attuGrey.light}`,
      backgroundColor: '#fff',
    },

    loading: {
      marginRight: '10px',
    },
    icon: {
      marginTop: theme.spacing(0.5),
    },
    flash: {
      animation: '$bgColorChange 1.5s infinite',
    },

    '@keyframes bgColorChange': {
      '0%': {
        backgroundColor: (props: any) => props.color,
      },
      '50%': {
        backgroundColor: 'transparent',
      },
      '100%': {
        backgroundColor: (props: any) => props.color,
      },
    },
  })
);

const StatusAction: FC<StatusActionType> = props => {
  const theme = useTheme();
  const classes = useStyles({ color: theme.palette.primary.main });
  const ReleaseIcon = icons.release;
  const LoadIcon = icons.load;

  const { status, percentage = 0, schema, action = () => {} } = props;
  const { t: commonTrans } = useTranslation();
  const { t: collectionTrans } = useTranslation('collection');

  const statusTrans = commonTrans('status');
  const {
    label,
    tooltip,
    icon = <span></span>,
    deleteIcon = <ReleaseIcon />,
  } = useMemo(() => {
    switch (status) {
      case LOADING_STATE.UNLOADED:
        return {
          label: statusTrans.unloaded,
          icon: <div className={`${classes.circle} ${classes.unloaded}`}></div>,
          tooltip: collectionTrans('clickToLoad'),
          deleteIcon: <LoadIcon />,
        };

      case LOADING_STATE.LOADED:
        return {
          label: statusTrans.loaded,
          icon: <div className={`${classes.circle} ${classes.loaded}`}></div>,
          tooltip: collectionTrans('clickToRelease'),
          deleteIcon: <ReleaseIcon />,
        };
      case LOADING_STATE.LOADING:
        return {
          label: `${percentage}% ${statusTrans.loading}`,
          tooltip: collectionTrans('collectionIsLoading'),
          icon: (
            <StatusIcon
              type={LoadingType.CREATING}
              className={classes.loading}
            />
          ),
        };

      default:
        return {
          label: statusTrans.error,
          icon: <span></span>,
          tooltip: '',
          deleteIcon: <ReleaseIcon />,
        };
    }
  }, [status, statusTrans, percentage]);

  const noIndex = schema && !schema.hasVectorIndex;
  const noVectorIndexTooltip = collectionTrans('noVectorIndexTooltip');
  const noIndexIcon = (
    <div className={`${classes.circle} ${classes.noIndex}`}></div>
  );

  return (
    <div className={classes.root}>
      <CustomToolTip
        title={noIndex ? noVectorIndexTooltip : tooltip}
        placement={'top'}
      >
        <Chip
          className={classes.chip}
          variant="outlined"
          label={<Typography>{label}</Typography>}
          onDelete={() => action()}
          onClick={(e: MouseEvent<HTMLDivElement>) => {
            e.stopPropagation();
            action();
          }}
          disabled={noIndex}
          deleteIcon={deleteIcon}
          size="small"
          icon={noIndex ? noIndexIcon : icon}
        />
      </CustomToolTip>
    </div>
  );
};

export default StatusAction;
