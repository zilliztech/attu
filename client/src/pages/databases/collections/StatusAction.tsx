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

// Define styles using MUI's makeStyles
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  chip: {
    border: 'none',
    marginRight: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: '50%',
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
    border: `1px solid ${theme.palette.text.disabled}`,
    backgroundColor: '#fff',
  },
  loading: {
    marginRight: theme.spacing(1.25),
  },
  extraBtn: {
    height: 24,
    padding: '0 8px',
  },
}));

const StatusAction: FC<StatusActionType> = props => {
  const {
    status,
    percentage = 0,
    collection,
    action = () => {},
    showExtraAction,
    showLoadButton,
    createIndexElement,
  } = props;

  // Theme and styles
  const theme = useTheme();
  const classes = useStyles();

  // Context
  const { setDialog } = useContext(rootContext);

  // Translations
  const { t: commonTrans } = useTranslation();
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  // Determine status-related labels and icons
  const { label, tooltip, icon, deleteIcon } = useMemo(() => {
    switch (status) {
      case LOADING_STATE.UNLOADED:
        return {
          label: commonTrans('status.unloaded'),
          tooltip: collectionTrans('clickToLoad'),
          icon: <div className={`${classes.circle} ${classes.unloaded}`}></div>,
          deleteIcon: <Icons.load />,
        };
      case LOADING_STATE.LOADED:
        return {
          label: commonTrans('status.loaded'),
          tooltip: collectionTrans('clickToRelease'),
          icon: <div className={`${classes.circle} ${classes.loaded}`}></div>,
          deleteIcon: <Icons.release />,
        };
      case LOADING_STATE.LOADING:
        return {
          label: `${percentage}% ${commonTrans('status.loading')}`,
          tooltip: collectionTrans('collectionIsLoading'),
          icon: (
            <StatusIcon
              type={LoadingType.CREATING}
              className={classes.loading}
            />
          ),
          deleteIcon: null, // No delete icon during loading
        };
      default:
        return {
          label: status,
          tooltip: '',
          icon: <span></span>,
          deleteIcon: <Icons.release />,
        };
    }
  }, [status, percentage, classes, collectionTrans]);

  // Handle missing vector index
  const noIndex = collection.schema && !collection.schema.hasVectorIndex;
  const noIndexIcon = (
    <div className={`${classes.circle} ${classes.noIndex}`}></div>
  );
  const noIndexTooltip = collectionTrans('noVectorIndexTooltip');

  // Handle chip click
  const handleChipClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component:
          status === LOADING_STATE.UNLOADED ? (
            <LoadCollectionDialog collection={collection} />
          ) : (
            <ReleaseCollectionDialog collection={collection} />
          ),
      },
    });
  };

  if (
    collection.schema &&
    status === LOADING_STATE.UNLOADED &&
    collection.schema.hasVectorIndex &&
    showLoadButton
  ) {
    return (
      <CustomButton
        startIcon={<Icons.load />}
        className={classes.extraBtn}
        variant="contained"
        tooltip={collectionTrans('clickToLoad')}
        onClick={() => {
          setDialog({
            open: true,
            type: 'custom',
            params: {
              component: <LoadCollectionDialog collection={collection} />,
            },
          });
        }}
      >
        {collectionTrans('loadTitle')}
      </CustomButton>
    );
  }

  return (
    <div className={classes.root}>
      <CustomToolTip title={noIndex ? noIndexTooltip : tooltip} placement="top">
        <Chip
          className={classes.chip}
          label={<Typography>{label}</Typography>}
          onClick={handleChipClick}
          disabled={noIndex}
          deleteIcon={<Icons.release />}
          size="small"
          icon={noIndex ? noIndexIcon : icon}
        />
      </CustomToolTip>

      {showExtraAction && collection.schema && (
        <>
          {status === LOADING_STATE.LOADED && (
            <CustomButton
              startIcon={<Icons.navSearch />}
              className={classes.extraBtn}
              tooltip={collectionTrans('clickToSearch')}
              onClick={() => {
                const newHash = window.location.hash.replace(
                  'schema',
                  'search'
                );
                window.location.hash = newHash;
              }}
            >
              {btnTrans('vectorSearch')}
            </CustomButton>
          )}

          {!collection.schema.hasVectorIndex && createIndexElement}
        </>
      )}
    </div>
  );
};

export default StatusAction;
