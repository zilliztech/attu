import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import Icons from '@/components/icons/Icons';
import { makeStyles, Theme } from '@material-ui/core';

type Connection = {
  url: string;
  database: string;
  time: string;
};

export interface ConnectionHistoryProps {
  data: Connection;
  onClick: (data: Connection) => void;
}

export const style = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
    width: 360,
    padding: `0 16px`,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    cursor: 'pointer',
  },
  time: {
    color: theme.palette.text.secondary,
    fontSize: '12px',
    padding: '12px 0',
  },
  url: {
    display: 'grid',
    gridTemplateColumns: '20px 1fr',
    gap: 4,
    color: theme.palette.text.primary,
    fontSize: '14px',
    padding: '12px 0',
    '& .url': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: 200,
      wordWrap: 'break-word',
    },
  },
  icon: {
    verticalAlign: '-3px',
    marginRight: 8,
    fontSize: '14px',
  },
}));

const ConnectHistory = (props: ConnectionHistoryProps) => {
  // props
  const { data, onClick } = props;

  // styles
  const classes = style();

  return (
    <li
      className={classes.root}
      onClick={() => {
        onClick(data);
      }}
    >
      <div className={classes.url}>
        <Icons.link className={classes.icon}></Icons.link>
        <div className="url">
          {data.url}/{data.database}
        </div>
      </div>
      <div className={classes.time}>{data.time}</div>
    </li>
  );
};

export default ConnectHistory;
