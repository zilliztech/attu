import { FC, useContext } from 'react';
import { makeStyles, Theme, Typography, useTheme } from '@material-ui/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MilvusService } from '@/http';
import icons from '@/components/icons/Icons';
import CustomButton from '@/components/customButton/CustomButton';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import { rootContext, authContext } from '@/context';
import { DatabaseObject } from '@server/types';
import CreateDatabaseDialog from '../dialogs/CreateDatabaseDialog';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    position: 'relative',
    display: `flex`,
    flexDirection: `column`,
    gap: theme.spacing(1),
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing(2),
    border: '1px solid #E0E0E0',
    minWidth: '168px',
    minHeight: '168px',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: '0px 0px 4px 0px #00000029',
    },
  },
  dbTitle: {
    fontSize: '20px',
    lineHeight: '24px',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    color: theme.palette.attuDark.main,
    '& svg': {
      verticalAlign: '-3px',
    },
    maxWidth: '168px',
    wordBreak: 'break-all',
  },
  label: {
    fontSize: '12px',
    lineHeight: '16px',
    color: theme.palette.attuDark.main,
  },
  value: {
    fontSize: '24px',
    lineHeight: '28px',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
  },
  delIcon: {
    color: theme.palette.attuGrey.main,
    cursor: 'pointer',
    position: 'absolute',
    right: 4,
    top: 4,
    minWidth: 0,
    minHeight: 0,
    padding: theme.spacing(0),
    '& svg': {
      width: 15,
    },
  },

  // create db
  create: {
    border: `1px dashed ${theme.palette.primary.main}`,
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.primary.main,
  },
}));

export interface DatabaseCardProps {
  wrapperClass?: string;
  database: DatabaseObject;
  setDatabase: (database: string) => void;
  dropDatabase: (params: { db_name: string }) => Promise<void>;
}

const DatabaseCard: FC<DatabaseCardProps> = ({
  database = { name: '', collections: [], createdTime: 0 },
  wrapperClass = '',
  setDatabase,
  dropDatabase,
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
  if (database.name === 'new') {
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
      <section className={`${classes.wrapper}`} onClick={onClick}>
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
              <CustomToolTip
                title={`${btnTrans('drop')} ${dbTrans('database')}`}
              >
                <DeleteIcon />
              </CustomToolTip>
            </CustomButton>
          )}
        </div>
      </section>
    </section>
  );
};

export default DatabaseCard;
