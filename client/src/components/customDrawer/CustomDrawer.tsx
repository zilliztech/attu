import { useContext } from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { rootContext } from '@/context';

const CustomDrawer = () => {
  const { drawer, setDrawer } = useContext(rootContext);

  const handleCloseDrawer = () => {
    setDrawer({
      ...drawer,
      open: false,
    });
  };

  return (
    <Drawer open={drawer.open} onClose={handleCloseDrawer} anchor="right">
      <Box sx={{ width: '33vw' }}>
        <div>{drawer.content}</div>

        {drawer.hasActionBar && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 1 }}>
            {drawer.actions?.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                sx={{ marginLeft: 1 }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CustomDrawer;
