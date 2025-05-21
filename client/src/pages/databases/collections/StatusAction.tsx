import { FC, useMemo, MouseEvent, useContext } from 'react';
import { StatusActionType } from '@/components/status/Types';
import { useTranslation } from 'react-i18next';
import { Typography, useTheme, Chip } from '@mui/material';
import { rootContext } from '@/context';
import { LOADING_STATE } from '@/consts';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import Icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import CustomButton from '@/components/customButton/CustomButton';
import LoadCollectionDialog from '@/pages/dialogs/LoadCollectionDialog';
import ReleaseCollectionDialog from '@/pages/dialogs/ReleaseCollectionDialog';

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

  // Theme
  const theme = useTheme();

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
          icon: (
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: `1px solid ${theme.palette.primary.main}`,
                background: '#fff',
                verticalAlign: 'middle',
              }}
            />
          ),
          deleteIcon: <Icons.load />,
        };
      case LOADING_STATE.LOADED:
        return {
          label: commonTrans('status.loaded'),
          tooltip: collectionTrans('clickToRelease'),
          icon: (
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                border: `1px solid ${theme.palette.primary.main}`,
                background: theme.palette.primary.main,
                verticalAlign: 'middle',
              }}
            />
          ),
          deleteIcon: <Icons.release />,
        };
      case LOADING_STATE.LOADING:
        return {
          label: `${percentage}% ${commonTrans('status.loading')}`,
          tooltip: collectionTrans('collectionIsLoading'),
          icon: (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: theme.spacing(1.25),
              }}
            >
              <StatusIcon type={LoadingType.CREATING} />
            </span>
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
  }, [status, percentage, theme, collectionTrans]);

  // Handle missing vector index
  const noIndex = collection.schema && !collection.schema.hasVectorIndex;
  const noIndexIcon = (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        border: `1px solid ${theme.palette.text.disabled}`,
        background: '#fff',
        verticalAlign: 'middle',
      }}
    />
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
        sx={{ height: 24, padding: '0 8px' }}
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
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <CustomToolTip title={noIndex ? noIndexTooltip : tooltip} placement="top">
        <Chip
          sx={{
            border: 'none',
            marginRight: theme.spacing(0.5),
            paddingLeft: theme.spacing(0.5),
          }}
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
              sx={{ height: 24, padding: '0 8px' }}
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
