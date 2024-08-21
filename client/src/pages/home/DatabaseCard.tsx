import { FC, useContext } from 'react';
import { Theme, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MilvusService } from '@/http';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { rootContext, authContext } from '@/context';
import { DatabaseObject } from '@server/types';
import CreateDatabaseDialog from '../dialogs/CreateDatabaseDialog';
import { CREATE_DB } from './Home';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    position: 'relative',
    display: `flex`,
    flexDirection: `column`,
    gap: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    minWidth: '168px',
    minHeight: '168px',
    cursor: 'pointer',
    borderRadius: 8,
    '&:hover': {
      boxShadow: '0px 0px 4px 0px #00000029',
      borderColor: theme.palette.primary.main,
    },
    '&.current': {
      boxShadow: '0px 0px 4px 0px #00000029',
      borderColor: theme.palette.primary.main,
    },
  },
  dbTitle: {
    fontSize: '20px',
    lineHeight: '24px',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    '& svg': {
      verticalAlign: '-3px',
    },
    maxWidth: '168px',
    wordBreak: 'break-all',
  },
  label: {
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.text.secondary,
  },
  value: {
    fontSize: '24px',
    lineHeight: '28px',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  delIcon: {
    color: theme.palette.text.secondary,
    cursor: 'pointer',
    position: 'absolute',
    width: 24,
    height: 24,
    lineHeight: 24,
    display: 'flex',
    top: 8,
    right: 8,
    minWidth: 8,
    '& svg': {
      width: 16,
      height: 16,
      overflow: 'hidden',
    },
    padding: theme.spacing(1),
  },

  // create db
  create: {
    border: `1px dashed ${theme.palette.primary.main}`,
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.text.primary,
  },
}));

export interface DatabaseCardProps {
  wrapperClass?: string;
  database: DatabaseObject;
  setDatabase: (database: string) => void;
  dropDatabase: (params: { db_name: string }) => Promise<void>;
  isActive?: boolean;
}

const DatabaseCard: FC<DatabaseCardProps> = ({
  database = { name: '', collections: [], createdTime: 0 },
  wrapperClass = '',
  setDatabase,
  dropDatabase,
  isActive = false,
}) => {
  // context
  const { isManaged } = useContext(authContext);
  const { setDialog, openSnackBar, handleCloseDialog } =
    useContext(rootContext);

  // i18n
  const { t: homeTrans } = useTranslation('home');
  const { t: successTrans } = useTranslation('success');
  const { t: dbTrans } = useTranslation('database');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');

  const navigate = useNavigate();

  const classes = useStyles();
  const theme = useTheme();
  const DbIcon = icons.database;
  const DeleteIcon = icons.delete;
  const PlusIcon = icons.add;
  const ZillizIcon = icons.zilliz;

  const onClick = async () => {
    // use database
    await MilvusService.useDatabase({ database: database.name });
    // set database
    setDatabase(database.name);

    // navigate to database detail page
    const targetPath = `/databases/${database.name}`;

    navigate(targetPath);
  };

  const handleDelete = async () => {
    await dropDatabase({ db_name: database.name });

    openSnackBar(successTrans('delete', { name: dbTrans('database') }));

    // use database
    await MilvusService.useDatabase({ database: 'default' });

    handleCloseDialog();
  };

  // empty database => create new database
  if (database.name === CREATE_DB.name) {
    return (
      <section
        className={`${wrapperClass} ${classes.wrapper} ${classes.create}`}
        onClick={() => {
          setDialog({
            open: true,
            type: 'custom',
            params: {
              component: <CreateDatabaseDialog />,
            },
          });
        }}
      >
        <PlusIcon />
        <Typography variant="h6">{dbTrans('createTitle')}</Typography>
      </section>
    );
  }

  return (
    <section className={`${wrapperClass}`}>
      <section
        className={`${classes.wrapper} ${isActive ? 'current' : ''}`}
        onClick={onClick}
      >
        <>
          {isManaged ? <ZillizIcon /> : <DbIcon />}

          <Typography variant="h3" className={classes.dbTitle}>
            {database.name}
          </Typography>
        </>
        <div>
          <div key={database.name}>
            <Typography className={classes.label}>
              {homeTrans('all')}
            </Typography>

            <Typography
              className={classes.value}
              style={{ color: theme.palette.primary.main }}
            >
              {database.collections.length}
            </Typography>
            {database.createdTime !== -1 && (
              <>
                <Typography className={classes.label}>
                  {homeTrans('createdTime')}
                </Typography>
                <Typography className={classes.label}>
                  {new Date(database.createdTime / 1000000).toLocaleString()}
                </Typography>
              </>
            )}
          </div>
          {database.name !== 'default' && (
            <CustomButton
              className={classes.delIcon}
              tooltip={`${btnTrans('drop')} ${dbTrans('database')}`}
              onClick={(event: any) => {
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
            </CustomButton>
          )}
        </div>
      </section>
    </section>
  );
};

export default DatabaseCard;
