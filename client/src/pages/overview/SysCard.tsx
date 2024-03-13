import { makeStyles, Theme, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  sysCard: {
    minWidth: 'auto',
    gap: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(2),
    border: '1px solid #E0E0E0',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: '0px 0px 4px 0px #00000029',
    },

    '& p': {
      fontSize: '24px',
      margin: 0,
    },
    '& h3': {
      margin: 0,
      fontSize: '14px',
      color: theme.palette.attuGrey.dark,
    },
    '& a': {
      textDecoration: 'none',
      color: '#000',
    },
  },
}));

const SysCard = (data: {
  title: string;
  count: number | string;
  des?: string;
  link?: string;
}) => {
  const classes = useStyles();

  const content = (
    <>
      <Typography component={'p'}>{data.count}</Typography>
      <Typography component={'h3'}>{data.title}</Typography>
      {data.des ? <Typography component={'p'}>{data.des}</Typography> : null}
    </>
  );

  return (
    <section className={classes.sysCard}>
      <section>
        {data.link ? <Link to={data.link}>{content}</Link> : content}
      </section>
    </section>
  );
};

export default SysCard;
