import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme, Theme } from '@mui/material';
import Progress from './Progress';
import { formatByteSize, formatSystemTime, getByteString } from '@/utils';
import { DataProgressProps, DataSectionProps, DataCardProps } from './Types';
import { makeStyles } from '@mui/styles';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(1.5, 2),
    boxSizing: 'border-box',
    flexGrow: 1,
    height: '100%',
  },

  title: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  content: {
    color: theme.palette.text.primary,
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '36px',
  },

  desc: {
    color: theme.palette.text.secondary,
    fontSize: '14px',
    lineHeight: '36px',
    marginLeft: theme.spacing(1),
  },

  rootName: {
    color: theme.palette.text.secondary,
    fontSize: 20,
  },

  childName: {
    color: theme.palette.primary.main,
    fontSize: 20,
  },

  ip: {
    color: theme.palette.text.primary,
    fontSize: 11,
    lineHeight: 2,
  },

  sectionRoot: {
    borderSpacing: '0 1px',
    display: 'table',
    marginTop: theme.spacing(0.5),
    width: '100%',
  },

  sectionRow: {
    display: 'table-row',
  },

  sectionHeaderCell: {
    display: 'table-cell',
    color: theme.palette.text.secondary,
    fontSize: '12px',
    lineHeight: '24px',
    padding: theme.spacing(0.5, 1),
    textTransform: 'uppercase',
    width: '50%',
  },

  sectionCell: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    display: 'table-cell',
    fontSize: 13,
    padding: theme.spacing(1),
    textTransform: 'capitalize',
    verticalAlign: 'middle',
    width: '50%',
  },
  progressTitle: {
    fontSize: '14px',
    color: theme.palette.text.primary,
    display: 'flex',
    justifyContent: 'space-between',
  },
}));

const DataSection: FC<DataSectionProps> = props => {
  const classes = getStyles();
  const { titles, contents } = props;

  return (
    <div className={classes.sectionRoot}>
      <div className={classes.sectionRow}>
        {titles.map(titleEntry => (
          <div key={titleEntry} className={classes.sectionHeaderCell}>
            {titleEntry}
          </div>
        ))}
      </div>
      {contents.map(contentEntry => {
        return (
          <div key={contentEntry.label} className={classes.sectionRow}>
            <div className={classes.sectionCell}>{contentEntry.label}</div>
            <div className={classes.sectionCell}>{contentEntry.value}</div>
          </div>
        );
      })}
    </div>
  );
};

const DataProgress: FC<DataProgressProps> = ({ percent = 0, desc = '' }) => {
  const classes = getStyles();
  const theme = useTheme();
  return (
    <div>
      <div className={classes.progressTitle}>
        <span>{`${Number(percent * 100).toFixed(2)}%`}</span>
        <span>{desc}</span>
      </div>
      <Progress percent={percent} color={theme.palette.primary.main} />
    </div>
  );
};

const DataCard: FC<
  DataCardProps & React.HTMLAttributes<HTMLDivElement>
> = props => {
  const classes = getStyles();
  const { t } = useTranslation('systemView');
  const { t: commonTrans } = useTranslation();
  const capacityTrans: { [key in string]: string } = commonTrans(
    'capacity'
  ) as any;
  const { node, extend } = props;

  const hardwareTitle = [t('hardwareTitle'), t('valueTitle')];
  const hardwareContent = [];

  const configTitle = [t('configTitle'), t('valueTitle')];
  const systemConfig: { label: string; value: any }[] = [];

  const systemTitle = [t('systemTitle'), t('valueTitle')];

  const systemContent = [];

  const {
    created_time: createTime,
    updated_time: updateTime,
    system_info = {},
    hardware_infos: infos = {},
    system_configurations,
  } = node?.infos || {};

  const {
    cpu_core_count: cpu = 0,
    cpu_core_usage: cpuUsage = 0,
    // memory = 1,
    memory_usage: memoryUsage = 0,
    disk = 1,
    disk_usage: diskUsage = 0,
  } = infos;
  const memUsage = formatByteSize(memoryUsage, capacityTrans);
  if (extend) {
    hardwareContent.push({ label: t('thCPUCount'), value: cpu });
    hardwareContent.push({
      label: t('thCPUUsage'),
      value: <DataProgress percent={cpuUsage / 100} />,
    });
    hardwareContent.push({
      label: t('thMemUsage'),
      value: `${memUsage.value} ${memUsage.unit}`,
    });
    // hardwareContent.push({
    //   label: t('thDiskUsage'),
    //   value: (
    //     <DataProgress
    //       percent={diskUsage / disk}
    //       desc={getByteString(diskUsage, disk, capacityTrans)}
    //     />
    //   ),
    // });
  }

  if (system_configurations) {
    Object.keys(system_configurations).forEach(key => {
      systemConfig.push({ label: key, value: system_configurations[key] });
    });
  }

  const { deploy_mode: mode = '', build_version: version = '' } = system_info;
  systemContent.push({ label: t('thVersion'), value: version });
  systemContent.push({ label: t('thDeployMode'), value: mode });
  systemContent.push({
    label: t('thCreateTime'),
    value: createTime ? formatSystemTime(createTime) : '',
  });
  systemContent.push({
    label: t('thUpdateTime'),
    value: updateTime ? formatSystemTime(updateTime) : '',
  });

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <div>
          <span className={classes.rootName}>Milvus / </span>
          <span className={classes.childName}>{node?.infos?.name}</span>
        </div>
        <div className={classes.ip}>{`${t('thIP')}:${infos?.ip || ''}`}</div>
      </div>
      <DataSection titles={systemTitle} contents={systemContent} />
      {extend && (
        <DataSection titles={hardwareTitle} contents={hardwareContent} />
      )}

      {systemConfig.length ? (
        <DataSection titles={configTitle} contents={systemConfig} />
      ) : null}
    </div>
  );
};

export default DataCard;
