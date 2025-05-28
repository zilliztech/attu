import { FC, useMemo, useContext } from 'react';
import { StatusActionType } from '@/components/status/Types';
import { useTranslation } from 'react-i18next';
import { Typography, useTheme, Chip, Box } from '@mui/material';
import { rootContext } from '@/context';
import { LOADING_STATE } from '@/consts';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import Icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import CustomButton from '@/components/customButton/CustomButton';
import LoadCollectionDialog from '@/pages/dialogs/LoadCollectionDialog';
import ReleaseCollectionDialog from '@/pages/dialogs/ReleaseCollectionDialog';

const StatusIndicator: FC<{ color: string; filled?: boolean }> = ({
  color,
  filled,
}) => (
  <span
    style={{
      display: 'inline-block',
      width: 8,
      height: 8,
      borderRadius: '50%',
      border: `1px solid ${color}`,
      background: filled ? color : '#fff',
      verticalAlign: 'middle',
    }}
  />
);

const StatusAction: FC<StatusActionType> = props => {
  const {
    status,
    percentage = 0,
    collection,
    showExtraAction,
    showLoadButton,
    createIndexElement,
    sx,
  } = props;

  const theme = useTheme();
  const { setDialog } = useContext(rootContext);
  const { t: commonTrans } = useTranslation();
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');

  const chipStyles = {
    border: 'none',
    paddingLeft: theme.spacing(0.5),
  };

  const LoadingIndicator = () => (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        marginRight: theme.spacing(1.25),
      }}
    >
      <StatusIcon type={LoadingType.CREATING} />
    </span>
  );

  const noIndex = collection.schema && !collection.schema.hasVectorIndex;
  const noIndexIcon = <StatusIndicator color={theme.palette.text.disabled} />;
  const noIndexTooltip = collectionTrans('noVectorIndexTooltip');

  const statusConfig = useMemo(() => {
    const baseConfig = {
      icon: <StatusIndicator color={theme.palette.primary.main} />,
      variant: 'outlined' as const,
      color: 'primary' as const,
      onClick: undefined as (() => void) | undefined,
    };

    switch (status) {
      case LOADING_STATE.UNLOADED:
        return {
          ...baseConfig,
          label: commonTrans(
            noIndex ? 'status.unloaded' : 'status.readyToLoad'
          ),
          tooltip: collectionTrans('clickToLoad'),
          onClick: () => {
            setDialog({
              open: true,
              type: 'custom',
              params: {
                component: <LoadCollectionDialog collection={collection} />,
              },
            });
          },
        };

      case LOADING_STATE.LOADED:
        return {
          ...baseConfig,
          label: commonTrans('status.loaded'),
          tooltip: collectionTrans('clickToRelease'),
          icon: <StatusIndicator color={theme.palette.primary.main} filled />,
          variant: 'filled' as const,
          onClick: () => {
            setDialog({
              open: true,
              type: 'custom',
              params: {
                component: <ReleaseCollectionDialog collection={collection} />,
              },
            });
          },
        };

      case LOADING_STATE.LOADING:
        return {
          ...baseConfig,
          label: `${percentage}% ${commonTrans('status.loading')}`,
          tooltip: collectionTrans('collectionIsLoading'),
          icon: <LoadingIndicator />,
          color: 'default' as const,
        };

      default:
        return {
          ...baseConfig,
          label: status,
          tooltip: '',
          icon: <span />,
        };
    }
  }, [
    status,
    percentage,
    theme,
    collectionTrans,
    commonTrans,
    collection,
    setDialog,
  ]);

  const renderStatusChip = () => (
    <CustomToolTip
      title={noIndex ? noIndexTooltip : statusConfig.tooltip}
      placement="top"
      enterDelay={1000}
      leaveDelay={0}
    >
      <Chip
        sx={{
          ...chipStyles,
          cursor: statusConfig.onClick ? 'pointer' : 'default',
          position: 'relative',
          '&:hover .action-icon': {
            display: 'inline-flex !important',
          },
        }}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography component="span">{statusConfig.label}</Typography>
            {status === LOADING_STATE.LOADED && (
              <Icons.release
                className="action-icon"
                style={{
                  fontSize: '14px',
                  display: 'none',
                  transition: 'all 0.2s',
                }}
              />
            )}
            {status === LOADING_STATE.UNLOADED && showLoadButton && (
              <Icons.load
                style={{
                  fontSize: '14px',
                  marginLeft: 2,
                }}
              />
            )}
            {status === LOADING_STATE.UNLOADED && !showLoadButton && (
              <Icons.load
                className="action-icon"
                style={{
                  fontSize: '14px',
                  display: 'none',
                  transition: 'all 0.2s',
                }}
              />
            )}
          </Box>
        }
        onClick={statusConfig.onClick}
        disabled={noIndex || !statusConfig.onClick}
        variant={statusConfig.variant}
        color={statusConfig.color}
        size="small"
        icon={noIndex ? noIndexIcon : statusConfig.icon}
      />
    </CustomToolTip>
  );

  const renderSearchButton = () =>
    status === LOADING_STATE.LOADED && (
      <CustomButton
        startIcon={<Icons.navSearch />}
        sx={{ height: 24, padding: '0 8px' }}
        tooltip={collectionTrans('clickToSearch')}
        onClick={() => {
          const newHash = window.location.hash.replace('schema', 'search');
          window.location.hash = newHash;
        }}
      >
        {btnTrans('vectorSearch')}
      </CustomButton>
    );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
        ...sx,
      }}
    >
      {renderStatusChip()}
      {showExtraAction && collection.schema && (
        <>
          {renderSearchButton()}
          {!collection.schema.hasVectorIndex && createIndexElement}
        </>
      )}
    </Box>
  );
};

export default StatusAction;
