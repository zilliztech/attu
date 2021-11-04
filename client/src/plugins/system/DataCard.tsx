
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import Progress from './Progress';
import { getByteString } from '../../utils/Format';
import { DataProgressProps, DataSectionProps, DataCardProps } from './Types';

const getStyles = makeStyles(() => ({
  root: {
    backgroundColor: '#F6F6F6',
    borderTopRightRadius: '8px',
    borderBottomRightRadius: '8px',
    height: '100%',
    padding: '20px 16px',
    boxSizing: 'border-box',
  },

  title: {
    display: 'flex',
    justifyContent: 'space-between',
  },

  content: {
    color: '#010E29',
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: '36px',
  },

  desc: {
    color: '#82838E',
    fontSize: '14px',
    lineHeight: '36px',
    marginLeft: "8px",
  },

  rootName: {
    color: '#82838E',
    fontSize: '20px',
    lineHeight: '24px',
  },

  childName: {
    color: '#06AFF2',
    fontSize: '20px',
    lineHeight: '24px',
  },

  ip: {
    color: '#010E29',
    fontSize: '16px',
    lineHeight: '24px',
  },

  sectionRoot: {
    borderSpacing: '0 1px',
    display: 'table',
    marginTop: '24px',
    width: '100%'
  },

  sectionRow: {
    display: 'table-row',
  },

  sectionHeaderCell: {
    display: 'table-cell',
    color: '#82838E',
    fontSize: '12px',
    lineHeight: '24px',
    padding: '8px 16px',
    textTransform: 'uppercase',
    width: '50%',
  },

  sectionCell: {
    backgroundColor: 'white',
    color: '#010E29',
    display: 'table-cell',
    fontSize: '14px',
    lineHeight: '24px',
    padding: '12px 16px',
    textTransform: 'capitalize',
    verticalAlign: 'middle',
    width: '50%',
  },
  progressTitle: {
    fontSize: '14px',
    color: '#010E29',
    lineHeight: '24px',
    display: 'flex',
    justifyContent: 'space-between',
  }
}));

const DataSection: FC<DataSectionProps> = (props) => {
  const classes = getStyles();
  const { titles, contents } = props;

  return (
    <div className={classes.sectionRoot}>
      <div className={classes.sectionRow}>
        {titles.map((titleEntry) => <div key={titleEntry} className={classes.sectionHeaderCell}>{titleEntry}</div>)}
      </div>
      {contents.map((contentEntry) => {
        return (
          <div key={contentEntry.label} className={classes.sectionRow}>
            <div className={classes.sectionCell}>
              {contentEntry.label}
            </div>
            <div className={classes.sectionCell}>
              {contentEntry.value}
            </div>
          </div>)
      })}
    </div>
  );
}

const DataProgress: FC<DataProgressProps> = ({ percent = 0, desc = '' }) => {
  const classes = getStyles();
  return (
    <div>
      <div className={classes.progressTitle}>
        <span>{`${Number(percent * 100).toFixed(2)}%`}</span>
        <span>{desc}</span>
      </div>
      <Progress percent={percent} color='#06AFF2' />
    </div>
  )
};

const DataCard: FC<DataCardProps & React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const classes = getStyles();
  const { t } = useTranslation('systemView');
  const { t: commonTrans } = useTranslation();
  const capacityTrans: { [key in string]: string } = commonTrans('capacity');
  const { node, extend } = props;
  const hardwareTitle = [t('hardwareTitle'), t('valueTitle')];
  const hardwareContent = [];
  const infos = node?.infos?.hardware_infos || {};

  const {
    cpu_core_count: cpu = 0,
    cpu_core_usage: cpuUsage = 0,
    memory = 1,
    memory_usage: memoryUsage = 0,
    disk = 1,
    disk_usage: diskUsage = 0,
  } = infos;

  if (extend) {
    hardwareContent.push({ label: t('thCPUCount'), value: cpu });
    hardwareContent.push({
      label: t('thCPUUsage'), value: <DataProgress percent={cpuUsage / 100} />
    });
    hardwareContent.push({
      label: t('thMemUsage'), value: <DataProgress percent={memoryUsage / memory} desc={getByteString(memoryUsage, memory, capacityTrans)} />
    });
    hardwareContent.push({
      label: t('thDiskUsage'), value: <DataProgress percent={diskUsage / disk} desc={getByteString(diskUsage, disk, capacityTrans)} />
    });
  }

  const systemTitle = [t('systemTitle'), t('valueTitle')];
  const systemContent = [];
  const sysInfos = node?.infos?.system_info || {};
  const {
    system_version: version,
    deploy_mode: mode = '',
    created_time: create = '',
    updated_time: update = '',
  } = sysInfos;
  systemContent.push({ label: t('thVersion'), value: version });
  systemContent.push({ label: t('thDeployMode'), value: mode });
  systemContent.push({ label: t('thCreateTime'), value: create });
  systemContent.push({ label: t('thUpdateTime'), value: update });

  return (
    <div className={classes.root}>
      <div className={classes.title}>
        <div>
          <span className={classes.rootName}>Milvus / </span>
          <span className={classes.childName}>{node?.infos?.name}</span>
        </div>
        <div className={classes.ip}>{`${t('thIP')}:${infos?.ip || ''}`}</div>
      </div>
      {extend && <DataSection titles={hardwareTitle} contents={hardwareContent} />}
      <DataSection titles={systemTitle} contents={systemContent} />
    </div>
  );
};

export default DataCard;