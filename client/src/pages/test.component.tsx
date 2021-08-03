import { makeStyles, Theme } from '@material-ui/core';
import CodeView from '../components/code/CodeView';

const getStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const CodePage = () => {
  const classes = getStyles();

  return (
    <div className={`page-wrapper ${classes.wrapper}`}>
      <CodeView />
    </div>
  );
};

export default CodePage;
