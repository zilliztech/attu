import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ITabListProps, ITabPanel } from './Types';
import type { SxProps, Theme } from '@mui/material/styles';

const tabSx: SxProps<Theme> = {
  textTransform: 'capitalize',
  minWidth: 0,
  marginRight: 3,
};

const tabsSx: SxProps<Theme> = {
  borderBottom: theme => `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    height: (theme: Theme) => theme.spacing(0.5),
  },
};

const tabPanelSx: SxProps<Theme> = {
  flexBasis: 0,
  flexGrow: 1,
  marginTop: 1,
  overflow: 'hidden',
};

const wrapperSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  flexBasis: 0,
  flexGrow: 1,
  backgroundColor: theme => theme.palette.background.paper,
  padding: 0,
};

const TabPanel = (props: ITabPanel & { sx?: SxProps<Theme> }) => {
  const { children, value, index, className = '', sx, ...other } = props;
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      className={className}
      id={`tabpanel-${index}`}
      aria-labelledby={`tabpanel-${index}`}
      sx={sx}
      width="100%"
      {...other}
    >
      {value === index && <Box height="100%">{children}</Box>}
    </Box>
  );
};

const a11yProps = (index: number) => ({
  id: `tab-${index}`,
  'aria-controls': `tabpanel-${index}`,
});

const RouteTabList: FC<ITabListProps> = props => {
  const { tabs, activeIndex = 0, wrapperClass = '' } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    const newPath =
      location.pathname.split('/').slice(0, -1).join('/') +
      '/' +
      tabs[newValue].path;
    navigate(newPath);
  };

  return (
    <Box sx={wrapperSx} className={wrapperClass}>
      <Tabs
        sx={tabsSx}
        TabIndicatorProps={{ children: <div className="tab-indicator" /> }}
        value={activeIndex}
        onChange={handleChange}
        aria-label="tabs"
      >
        {tabs.map((tab, index) => (
          <Tab
            sx={tabSx}
            key={tab.label}
            label={tab.label}
            {...a11yProps(index)}
          />
        ))}
      </Tabs>

      {tabs.map((tab, index) => (
        <TabPanel
          key={tab.label}
          value={activeIndex}
          index={index}
          sx={tabPanelSx}
        >
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
};

export default RouteTabList;
