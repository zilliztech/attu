import { FC, useMemo, useContext } from 'react';
import { StatusActionType } from '@/components/status/Types';
import { useTranslation } from 'react-i18next';
import { useTheme, Chip, Box } from '@mui/material';
import { rootContext } from '@/context';
import { LOADING_STATE } from '@/consts';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import Icons from '@/components/icons/Icons';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
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

  const chipStyles = {
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

  type IconConfig = {
    icon: JSX.Element | null;
    show: boolean;
  };

  const getIconConfig = (
    status: (typeof LOADING_STATE)[keyof typeof LOADING_STATE]
  ): IconConfig => {
    const iconConfigs: Partial<
      Record<(typeof LOADING_STATE)[keyof typeof LOADING_STATE], IconConfig>
    > = {
      [LOADING_STATE.LOADED]: {
        icon: (
          <Icons.release
            className="action-icon"
            style={{
              fontSize: '14px',
              display: 'none',
              fontWeight: 500,
              transition: 'all 0.2s',
              color: 'inherit',
            }}
          />
        ),
        show: true,
      },
      [LOADING_STATE.UNLOADED]: {
        icon: noIndex ? null : (
          <Icons.load
            style={{
              fontSize: '14px',
              fontWeight: 500,
              marginLeft: showLoadButton ? 2 : 0,
              display: showLoadButton ? 'inline' : 'none',
              color: 'inherit',
            }}
            className={!showLoadButton ? 'action-icon' : ''}
          />
        ),
        show: !noIndex,
      },
    };

    return iconConfigs[status] || { icon: null, show: false };
  };

  const statusConfig = useMemo(() => {
    const baseConfig = {
      icon: <StatusIndicator color={theme.palette.primary.main} />,
      variant: 'outlined' as const,
      color: 'primary' as const,
      onClick: undefined as (() => void) | undefined,
    };

    const configs = {
      [LOADING_STATE.UNLOADED]: {
        ...baseConfig,
        label: commonTrans(
          noIndex ? 'status.noVectorIndex' : 'status.readyToLoad'
        ),
        tooltip: collectionTrans('clickToLoad'),
        variant: 'outlined' as const,
        onClick: () => {
          setDialog({
            open: true,
            type: 'custom',
            params: {
              component: <LoadCollectionDialog collection={collection} />,
            },
          });
        },
      },
      [LOADING_STATE.LOADED]: {
        ...baseConfig,
        label: commonTrans('status.loaded'),
        tooltip: collectionTrans('clickToRelease'),
        icon: <StatusIndicator color={theme.palette.primary.main} filled />,
        onClick: () => {
          setDialog({
            open: true,
            type: 'custom',
            params: {
              component: <ReleaseCollectionDialog collection={collection} />,
            },
          });
        },
      },
      [LOADING_STATE.LOADING]: {
        ...baseConfig,
        label: `${percentage}% ${commonTrans('status.loading')}`,
        tooltip: collectionTrans('collectionIsLoading'),
        icon: <LoadingIndicator />,
      },
    };

    return (
      configs[status] || {
        ...baseConfig,
        label: status,
        tooltip: '',
        icon: <span />,
      }
    );
  }, [
    status,
    percentage,
    theme,
    collectionTrans,
    commonTrans,
    collection,
    setDialog,
  ]);

  const renderStatusChip = () => {
    const iconConfig = getIconConfig(status);

    const getChipStyles = () => {
      if (noIndex) {
        return {
          ...chipStyles,
          cursor: 'default',
          fontSize: '12px',
          borderColor:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[600]
              : theme.palette.text.disabled,
          backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#fff',
          color:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[400]
              : theme.palette.text.disabled,
        };
      }

      if (status === LOADING_STATE.UNLOADED) {
        return {
          ...chipStyles,
          cursor: 'pointer',
          fontSize: '12px',
          borderColor: theme.palette.primary.main,
          backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.primary.main : '#fff',
          color:
            theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
          '&:hover': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? theme.palette.primary.dark
                : `${theme.palette.primary.main} !important`,
            color: '#fff !important',
            '& svg': {
              color: '#fff !important',
            },
          },
        };
      }

      if (status === LOADING_STATE.LOADED) {
        return {
          ...chipStyles,
          cursor: 'pointer',
          fontSize: '12px',
          borderColor: 'transparent',
          backgroundColor: theme.palette.primary.light,
          color: theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.palette.text.primary,
            '& .action-icon': {
              display: 'inline-flex !important',
              color: theme.palette.text.primary,
            },
          },
        };
      }

      return {
        ...chipStyles,
        cursor: 'default',
        fontSize: '12px',
      };
    };

    return (
      <CustomToolTip
        title={noIndex ? noIndexTooltip : statusConfig.tooltip}
        placement="top"
        enterDelay={1000}
        leaveDelay={0}
      >
        <Chip
          sx={getChipStyles()}
          label={
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              {statusConfig.label}
              {iconConfig.show && iconConfig.icon}
            </Box>
          }
          onClick={statusConfig.onClick}
          disabled={noIndex}
          variant={statusConfig.variant}
          color={statusConfig.color}
          size="small"
          icon={noIndex ? noIndexIcon : statusConfig.icon}
        />
      </CustomToolTip>
    );
  };

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
      {showExtraAction &&
        collection.schema &&
        !collection.schema.hasVectorIndex &&
        createIndexElement}
    </Box>
  );
};

export default StatusAction;
