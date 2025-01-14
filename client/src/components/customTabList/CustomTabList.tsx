import { Box, Tab, Tabs } from '@mui/material';
import { FC, useState } from 'react';
import { useStyles } from './style';
import type { ITabListProps, ITabPanel } from './Types';

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
  const { tabs, activeIndex = 0, handleTabChange, wrapperClass = '' } = props;
  const classes = useStyles();
  const [value, setValue] = useState<number>(activeIndex);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);

    handleTabChange && handleTabChange(newValue);
  };

  return (
    <div className={`${classes.wrapper}  ${wrapperClass}`}>
      <Tabs
        classes={{
          indicator: classes.tab,
          flexContainer: classes.tabContainer,
        }}
        // if not provide this property, Material will add single span element by default
        TabIndicatorProps={{ children: <div className="tab-indicator" /> }}
        value={value}
        onChange={handleChange}
        aria-label="tabs"
      >
        {tabs.map((tab, index) => (
          <Tab
            classes={{ root: classes.tabContent }}
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
    </div>
  );
};

export default CustomTabList;
