import { IconButton, makeStyles } from '@material-ui/core';
import { useState } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { copyToCommand } from '../../utils/Common';
import CustomToolTip from '../customToolTip/CustomToolTip';
import Icons from '../icons/Icons';

const useStyles = makeStyles(theme => ({
  copy: {
    cursor: 'pointer',
    '& svg': {
      fontSize: '12.8px',
    },
  },
}));

let timer: null | NodeJS.Timeout = null;
const Copy = (props: { data: any }) => {
  const classes = useStyles();
  const { data } = props;
  const { t } = useTranslation();
  const copyTrans = t('copy') as any;
  const [title, setTitle] = useState(copyTrans.copy);

  const handleCopy = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    data: string
  ) => {
    if (timer) {
      clearTimeout(timer);
    }
    e.stopPropagation();

    const cb = () => {
      setTitle(copyTrans.copied);
      setTimeout(() => {
        setTitle(copyTrans.copy);
      }, 1100);
    };
    timer = setTimeout(() => {
      copyToCommand(data, '', cb);
    }, 200);
  };

  return (
    <CustomToolTip leaveDelay={900} title={title} placement="top">
      <IconButton className={classes.copy} onClick={e => handleCopy(e, data)}>
        {Icons.copy()}
      </IconButton>
    </CustomToolTip>
  );
};

export default Copy;
