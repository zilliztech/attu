import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@material-ui/core/Button';
import SvgIcon from '@material-ui/core/SvgIcon';
import { makeStyles, Theme, Link } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import GitHubIcon from '@material-ui/icons/GitHub';
import { ReactComponent as peopleIcon } from '../../assets/icons/people.svg';
import { ReactComponent as slackIcon } from '../../assets/icons/slack.svg';
import qrcodePath from '../../assets/imgs/wechat_qrcode.png';

const SLACK_LINK = 'https://slack.milvus.io';
const GITHUB_LINK = 'https://github.com/milvus-io/milvus/discussions';

const getStyles = makeStyles((theme: Theme) => ({
  root: {
    bottom: theme.spacing(2),
    position: 'absolute',
    right: theme.spacing(3),
    width: theme.spacing(5),
    zIndex: 3,
  },
  menuBtn: {
    border: '1px solid #E9E9ED',
    borderRadius: '50%',
    bottom: 0,
    boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',
    height: theme.spacing(5),
    minWidth: 'auto',
    padding: 0,
    position: 'absolute',
    width: theme.spacing(5),
  },
  chevronIcon: {
    transform: 'rotateZ(90deg)',
    fill: theme.palette.primary.main,
  },
  container: {
    bottom: theme.spacing(7),
    position: 'absolute',
    width: '360px',
    overflow: 'hidden',
    fontFamily: 'Roboto',
  },
  head: {
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing(1.5, 2.5),
    color: '#fff',
    borderTopLeftRadius: theme.spacing(1),
    borderTopRightRadius: theme.spacing(1),
  },
  title: {
    fontWeight: 700,
    fontSize: theme.spacing(2),
    lineHeight: theme.spacing(3),
    letterSpacing: '-0.01em',
    fontFamily: 'Roboto'
  },
  titleDesc: {
    color: '#f0f4f9',
    fontSize: theme.spacing(1.5),
    lineHeight: theme.spacing(2),
  },
  body: {
    backgroundColor: '#fff',
    border: '1px solid #e9e9e9',
    borderTop: 0,
    borderBottomRightRadius: theme.spacing(1),
    borderBottomLeftRadius: theme.spacing(1),
    padding: theme.spacing(3),
  },
  block: {
    border: '1px solid #f9f9f9',
    borderRadius: theme.spacing(1),
    boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.05)',
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
  },
  contentTitle: {
    fontWeight: 500,
    fontSize: theme.spacing(1.75),
    lineHeight: theme.spacing(2.5),

  },
  contentDesc: {
    fontSize: theme.spacing(1.5),
    lineHeight: theme.spacing(2.5),
    color: theme.palette.attuGrey.dark,
    marginBottom: theme.spacing(1),

  },
  contentLink: {
    display: 'block',
    fontSize: theme.spacing(1.5),
    lineHeight: theme.spacing(2.5),
    letterSpacing: '-0.01em',
    color: theme.palette.primary.main,
  },
  qrImg: {
    display: 'block',
    margin: '0 auto',
    width: theme.spacing(10),
  },
  textCenter: {
    textAlign: 'center',
  },
  icon: {
    marginTop: theme.spacing(2),
    width: theme.spacing(2.5),
    height: theme.spacing(2.5),
  }
}));

const CommunityBtn = (props: any) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const classes = getStyles();
  const { t } = useTranslation();
  const communityTrans: { [key in string]: string } = t('community');

  return (
    <div className={classes.root}>
      {open && (
        <div className={classes.container}>
          <div className={classes.head}>
            <div className={classes.title}>
              {communityTrans.hi}
            </div>
            <div className={classes.titleDesc}>
              {communityTrans.growing}
            </div>
          </div>
          <div className={classes.body}>
            <div className={classes.block}>
              <div className={`${classes.contentTitle} ${classes.textCenter}`}>
                {communityTrans.question}
              </div>
              <div className={`${classes.contentDesc} ${classes.textCenter}`}>
                {communityTrans.qr}
              </div>
              <img className={classes.qrImg} src={qrcodePath} alt="qrcode" />
            </div>
            <div className={classes.block}>
              <div className={`${classes.contentTitle} ${classes.textCenter}`}>
                {communityTrans.more}
              </div>

              <SvgIcon viewBox="0 0 24 24" component={slackIcon} className={classes.icon} />
              <div className={classes.contentDesc}>
                {communityTrans.join}
              </div>
              <Link
                classes={{ root: classes.contentLink }}
                href={SLACK_LINK}
                underline='always'
                target="_blank"
                rel="noopener"
              >
                {SLACK_LINK}
              </Link>

              <SvgIcon viewBox="0 0 24 24" component={GitHubIcon} className={classes.icon} />
              <div className={classes.contentDesc}>
                {communityTrans.get}
              </div>
              <Link
                classes={{ root: classes.contentLink }}
                href={GITHUB_LINK}
                underline='always'
                target="_blank"
                rel="noopener"
              >
                {GITHUB_LINK}
              </Link>
            </div>
          </div>
        </div>
      )}
      <Button
        className={classes.menuBtn}
        aria-haspopup="true"
        onClick={() => { setOpen(!open) }}
      >
        {open ?
          <ChevronRightIcon className={classes.chevronIcon} />
          :
          <SvgIcon viewBox="0 0 24 24" component={peopleIcon} />
        }
      </Button>
    </div>
  );
};

export default CommunityBtn;
