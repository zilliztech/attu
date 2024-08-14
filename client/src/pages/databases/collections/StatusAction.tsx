import { FC, useMemo, MouseEvent, useContext } from 'react';
import { StatusActionType } from '@/components/status/Types';
import { useTranslation } from 'react-i18next';
import { Theme, Typography, useTheme, Chip } from '@mui/material';
import { rootContext } from '@/context';
import { LOADING_STATE } from '@/consts';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import Icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import CustomButton from '@/components/customButton/CustomButton';
import LoadCollectionDialog from '@/pages/dialogs/LoadCollectionDialog';
import ReleaseCollectionDialog from '@/pages/dialogs/ReleaseCollectionDialog';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
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
  extraBtn: {
    height: 24,
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
}));

const StatusAction: FC<StatusActionType> = props => {
  const theme = useTheme();
  const { setDialog } = useContext(rootContext);

  const classes = useStyles({ color: theme.palette.primary.main });
  const ReleaseIcon = Icons.release;
  const LoadIcon = Icons.load;

  const { status, percentage = 0, collection, action = () => {} } = props;
  const { t: commonTrans } = useTranslation();
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

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
          label: status,
          icon: <span></span>,
          tooltip: '',
          deleteIcon: <ReleaseIcon />,
        };
    }
  }, [status, statusTrans, percentage]);

  const noIndex = collection.schema && !collection.schema.hasVectorIndex;
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
            setDialog({
              open: true,
              type: 'custom',
              params: {
                component:
                  collection.status === LOADING_STATE.UNLOADED ? (
                    <LoadCollectionDialog collection={collection} />
                  ) : (
                    <ReleaseCollectionDialog collection={collection} />
                  ),
              },
            });
          }}
          disabled={noIndex}
          deleteIcon={deleteIcon}
          size="small"
          icon={noIndex ? noIndexIcon : icon}
        />
      </CustomToolTip>

      {props.showExtraAction && collection.schema && (
        <>
          {status === LOADING_STATE.LOADED && (
            <CustomButton
              startIcon={<Icons.navSearch />}
              className={classes.extraBtn}
              tooltip={collectionTrans('clickToSearch')}
              onClick={() => {
                const currentHash = window.location.hash;
                const newHash = currentHash.replace('overview', 'search');

                window.location.hash = newHash;
              }}
            >
              {btnTrans('vectorSearch')}
            </CustomButton>
          )}

          {collection.schema &&
            !collection.schema.hasVectorIndex &&
            props.createIndexElement}
        </>
      )}
    </div>
  );
};

export default StatusAction;
