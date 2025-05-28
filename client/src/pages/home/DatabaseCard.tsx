import { FC, useContext } from 'react';
import { Typography, useTheme, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MilvusService, DatabaseService } from '@/http';
import icons from '@/components/icons/Icons';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { rootContext, authContext } from '@/context';
import type { DatabaseObject } from '@server/types';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export interface DatabaseCardProps {
  wrapperClass?: string;
  database: DatabaseObject;
  setDatabase: (database: string) => void;
  fetchDatabases: () => void;
  isActive?: boolean;
}

const DatabaseCard: FC<DatabaseCardProps> = ({
  database = { name: '', collections: [], createdTime: 0 },
  wrapperClass = '',
  setDatabase,
  fetchDatabases,
  isActive = false,
}) => {
  // context
  const { isManaged, isServerless } = useContext(authContext);
  const { setDialog, openSnackBar, handleCloseDialog } =
    useContext(rootContext);

  // i18n
  const { t: homeTrans } = useTranslation('home');
  const { t: successTrans } = useTranslation('success');
  const { t: dbTrans } = useTranslation('database');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const navigate = useNavigate();
  const theme = useTheme();
  const DbIcon = icons.database;
  const DeleteIcon = icons.delete;
  const ZillizIcon = icons.zilliz;

  const onClick = async () => {
    await MilvusService.useDatabase({ database: database.name });
    setDatabase(database.name);
    const targetPath = `/databases/${database.name}/collections`;
    navigate(targetPath);
  };

  const handleDelete = async () => {
    await DatabaseService.dropDatabase({ db_name: database.name });
    await fetchDatabases();
    openSnackBar(successTrans('delete', { name: dbTrans('database') }));
    await MilvusService.useDatabase({ database: 'default' });
    handleCloseDialog();
  };

  return (
    <Box component="section" className={wrapperClass}>
      <Box
        component="section"
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          backgroundColor: theme => theme.palette.background.paper,
          color: theme => theme.palette.text.primary,
          padding: 2,
          border: theme => `1px solid ${theme.palette.divider}`,
          minWidth: '128px',
          minHeight: '128px',
          cursor: 'pointer',
          borderRadius: 2,
          '&:hover': {
            borderColor: theme => theme.palette.primary.main,
          },
          ...(isActive && {
            borderColor: theme => theme.palette.primary.main,
          }),
        }}
        onClick={onClick}
      >
        <>
          {isManaged ? <ZillizIcon /> : <DbIcon />}
          <Typography
            variant="h3"
            sx={{
              fontSize: '20px',
              lineHeight: '24px',
              fontWeight: '500',
              mb: 1,
              maxWidth: '128px',
              wordBreak: 'break-all',
              '& svg': {
                verticalAlign: '-3px',
              },
            }}
          >
            {database.name}
          </Typography>
        </>
        <Box>
          <Box key={database.name}>
            <Typography
              sx={{
                fontSize: '12px',
                lineHeight: '16px',
                color: theme => theme.palette.text.secondary,
              }}
            >
              {homeTrans('all')}
            </Typography>
            <Typography
              sx={{
                fontSize: '24px',
                lineHeight: '28px',
                fontWeight: 'bold',
                mb: 1,
                color: theme.palette.primary.main,
              }}
            >
              {database.collections.length}
            </Typography>
            {database.createdTime !== -1 && (
              <>
                <Typography
                  sx={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: theme => theme.palette.text.secondary,
                  }}
                >
                  {homeTrans('createdTime')}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: theme => theme.palette.text.secondary,
                  }}
                >
                  {new Date(database.createdTime / 1000000).toLocaleString()}
                </Typography>
              </>
            )}
          </Box>
          {database.name !== 'default' && !isServerless && (
            <Tooltip
              title={`${btnTrans('drop')} ${dbTrans('database')}`}
              placement="top"
              arrow
            >
              <IconButton
                sx={{
                  color: theme => theme.palette.text.secondary,
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  width: 24,
                  height: 24,
                  p: 0,
                  '& svg': {
                    width: 16,
                    height: 16,
                  },
                }}
                onClick={event => {
                  event.stopPropagation();
                  setDialog({
                    open: true,
                    type: 'custom',
                    params: {
                      component: (
                        <DeleteTemplate
                          label={btnTrans('drop')}
                          title={dialogTrans('deleteTitle', {
                            type: dbTrans('database'),
                          })}
                          text={dbTrans('deleteWarning')}
                          handleDelete={handleDelete}
                          compare={database.name}
                        />
                      ),
                    },
                  });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DatabaseCard;
