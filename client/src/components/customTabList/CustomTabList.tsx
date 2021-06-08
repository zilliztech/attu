import { Box, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import React, { FC, useState } from 'react';
import { ITabListProps, ITabPanel } from './Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    '& .MuiTab-wrapper': {
      textTransform: 'capitalize',
      fontWeight: 'bold',
      color: '#323232',
    },
  },
  tab: {
    height: theme.spacing(0.5),
    backgroundColor: theme.palette.primary.main,
  },
  tabContainer: {
    borderBottom: '1px solid #e9e9ed',
  },
  tabContent: {
    minWidth: 0,
    marginRight: theme.spacing(3),
  },
  tabPanel: {
    flexGrow: 1,
  },
}));

const TabPanel = (props: ITabPanel) => {
  const { children, value, index, className = '', ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      className={className}
      id={`tabpanel-${index}`}
      aria-labelledby={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box height="100%">{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
};

const CustomTabList: FC<ITabListProps> = props => {
  const { tabs, activeIndex = 0, handleTabChange } = props;
  const classes = useStyles();
  const [value, setValue] = useState<number>(activeIndex);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);

    handleTabChange && handleTabChange(newValue);
  };

  return (
    <>
      <Tabs
        classes={{
          root: classes.wrapper,
          indicator: classes.tab,
          flexContainer: classes.tabContainer,
        }}
        value={value}
        onChange={handleChange}
        aria-label="tabs"
      >
        {tabs.map((tab, index) => (
          <Tab
            classes={{ root: classes.tabContent }}
            textColor="primary"
            key={tab.label}
            label={tab.label}
            {...a11yProps(index)}
          ></Tab>
        ))}
      </Tabs>

      {tabs.map((tab, index) => (
        <TabPanel
          key={tab.label}
          value={value}
          index={index}
          className={classes.tabPanel}
        >
          {tab.component}
        </TabPanel>
      ))}
    </>
  );
};

export default CustomTabList;
