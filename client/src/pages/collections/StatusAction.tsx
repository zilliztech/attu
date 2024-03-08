import { FC, useMemo, MouseEvent } from 'react';
import {
  ChildrenStatusType,
  StatusActionType,
} from '@/components/status/Types';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
  Theme,
  createStyles,
  Typography,
  useTheme,
  Tooltip,
  Chip,
} from '@material-ui/core';
import { LOADING_STATE } from '@/consts';
import StatusIcon from '@/components/status/StatusIcon';
import icons from '@/components/icons/Icons';
import IndexTypeElement from '@/pages/schema/IndexTypeElement';

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
      backgroundColor: (props: any) => props.color,
      borderRadius: '50%',
      width: '10px',
      height: '10px',
    },

    circleUnload: {
      backgroundColor: theme.palette.attuGrey.main,
      borderRadius: '50%',
      width: '10px',
      height: '10px',
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
  const ReleaseIcon = icons.remove;
  const LoadIcon = icons.addOutline;

  const {
    status,
    percentage = 0,
    collectionName,
    field,
    action = () => {},
    onIndexCreate,
  } = props;
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
          icon: <div className={`${classes.circleUnload}`}></div>,
          tooltip: collectionTrans('clickToLoad'),
          deleteIcon: <LoadIcon />,
        };

      case LOADING_STATE.LOADED:
        return {
          label: statusTrans.loaded,
          icon: <div className={classes.circle}></div>,
          tooltip: collectionTrans('clickToRelease'),
          deleteIcon: <ReleaseIcon />,
        };
      case LOADING_STATE.LOADING:
        return {
          label: `${percentage}% ${statusTrans.loading}`,
          tooltip: collectionTrans('collectionIsLoading'),
          icon: (
            <StatusIcon
              type={ChildrenStatusType.CREATING}
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

  // UI state
  const collectionLoaded = status === LOADING_STATE.LOADED;
  return (
    <div className={classes.root}>
      {field.hasVectorIndex && (
        <Tooltip arrow interactive title={tooltip} placement={'top'}>
          <Chip
            className={classes.chip}
            variant="outlined"
            label={<Typography>{label}</Typography>}
            onDelete={() => action()}
            onClick={(e: MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              action();
            }}
            deleteIcon={deleteIcon}
            size="small"
            icon={icon}
          />
        </Tooltip>
      )}
      <IndexTypeElement
        field={field.vectorFields[0]!}
        collectionName={collectionName}
        disabled={collectionLoaded}
        disabledTooltip={collectionTrans('releaseCollectionFirst')}
      />
    </div>
  );
};

export default StatusAction;
