import { Box, Tab, Tabs } from '@mui/material';
import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ITabListProps, ITabPanel } from './Types';
import { useStyles } from './style';

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

const RouteTabList: FC<ITabListProps> = props => {
  const { tabs, activeIndex = 0, wrapperClass = '' } = props;
  const classes = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event: any, newValue: any) => {
    const newPath =
      location.pathname.split('/').slice(0, -1).join('/') +
      '/' +
      tabs[newValue].path;

    navigate(newPath);
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
        value={activeIndex}
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
          value={activeIndex}
          index={index}
          className={classes.tabPanel}
        >
          {tab.component}
        </TabPanel>
      ))}
    </div>
  );
};

export default RouteTabList;
