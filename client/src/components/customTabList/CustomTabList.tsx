import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { FC, useState } from 'react';
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
      style={{ width: '100%' }}
    >
      {value === index && <Box height="100%">{children}</Box>}
    </div>
  );
};

const a11yProps = (index: number) => ({
  id: `tab-${index}`,
  'aria-controls': `tabpanel-${index}`,
});

const CustomTabList: FC<ITabListProps> = props => {
  const { tabs, activeIndex = 0, handleTabChange, wrapperClass = '' } = props;
  const [value, setValue] = useState<number>(activeIndex);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    handleTabChange && handleTabChange(newValue);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexBasis: 0,
        flexGrow: 1,
        backgroundColor: theme => theme.palette.background.paper,
        padding: 0,
      }}
      className={wrapperClass}
    >
      <Tabs
        sx={{
          borderBottom: theme => `1px solid ${theme.palette.divider}`,
          '& .MuiTabs-indicator': {
            height: theme => theme.spacing(0.5),
          },
        }}
        value={value}
        onChange={handleChange}
        aria-label="tabs"
      >
        {tabs.map((tab, index) => (
          <Tab
            sx={{
              textTransform: 'capitalize',
              minWidth: 0,
              fontSize: '13px',
            }}
            key={tab.label}
            label={tab.label}
            {...a11yProps(index)}
          />
        ))}
      </Tabs>

      {tabs.map((tab, index) => (
        <TabPanel
          key={tab.label}
          value={value}
          index={index}
          className=""
          style={{
            flexBasis: 0,
            flexGrow: 1,
            marginTop: 8,
            overflow: 'hidden',
          }}
        >
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default CustomTabList;
