import { FormControlLabel, makeStyles, Switch, Theme } from '@material-ui/core';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomSwitchProps } from './Types';

const getStyles = makeStyles((theme: Theme) => ({
  label: {
    color: '#757575',
  },

  placement: {
    marginLeft: 0,
  },
}));

const CustomSwitch: FC<CustomSwitchProps> = ({ onChange }) => {
  const classes = getStyles();
  const { t: commonTrans } = useTranslation();

  return (
    <FormControlLabel
      classes={{
        label: classes.label,
        labelPlacementStart: classes.placement,
      }}
      label={commonTrans('view')}
      labelPlacement="start"
      control={<Switch color="primary" onChange={onChange} />}
    />
  );
};

export default CustomSwitch;
