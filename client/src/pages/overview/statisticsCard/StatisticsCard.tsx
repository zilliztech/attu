import { FC, useMemo } from 'react';
import { makeStyles, Theme, Typography, useTheme } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatisticsCardProps } from './Types';
import { formatNumber } from '@/utils';
import { LOADING_STATE } from '@/consts';
import icons from '@/components/icons/Icons';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: `flex`,
    flexDirection: `column`,
    gap: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(2),
    border: '1px solid #E0E0E0',
    minWidth: 'auto',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: '0px 0px 4px 0px #00000029',
    },
  },
  dbTitle: {
    fontSize: '20px',
    lineHeight: '24px',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    color: theme.palette.attuDark.main,
    '& svg': {
      verticalAlign: '-3px',
    },
  },
  label: {
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.attuDark.main,
  },
  value: {
    fontSize: '24px',
    lineHeight: '28px',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
}));

const StatisticsCard: FC<StatisticsCardProps> = ({
  collections = [],
  database = '',
  wrapperClass = '',
}) => {
  const { t: overviewTrans } = useTranslation('overview');

  const navigation = useNavigate();
  const classes = useStyles();
  const theme = useTheme();
  const DbIcon = icons.database;

  const loadCollections = collections.filter(
    c => c.status !== LOADING_STATE.UNLOADED && typeof c.status !== 'undefined'
  );

  const statisticsData = useMemo(() => {
    return {
      data: [
        {
          label: overviewTrans('all'),
          value: collections.length,
          valueColor: theme.palette.primary.main,
        },
        // {
        //   label: overviewTrans('load'),
        //   value: formatNumber(loadCollections.length),
        //   valueColor: '#07d197',
        // },

        // {
        //   label: overviewTrans('data'),
        //   value: overviewTrans('rows', {
        //     number: formatNumber(
        //       collections.reduce(
        //         (acc, cur) => acc + Number(cur.rowCount || -1),
        //         0
        //       )
        //     ),
        //   }) as string,
        //   valueColor: theme.palette.primary.dark,
        // },
      ],
    };
  }, [overviewTrans, loadCollections]);

  const onClick = () => {
    // navigate to database detail page
    navigation(`/databases/${database}`);
  };

  return (
    <section className={`${wrapperClass}`}>
      <section className={`${classes.wrapper}`} onClick={onClick}>
        <Typography variant="h3" className={classes.dbTitle}>
          <DbIcon /> {database}
        </Typography>
        <div>
          {statisticsData.data.map((item: any) => (
            <div key={item.label}>
              <Typography className={classes.label}>{item.label}</Typography>
              <Typography
                className={classes.value}
                style={{ color: item.valueColor }}
              >
                {item.value}
              </Typography>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default StatisticsCard;
