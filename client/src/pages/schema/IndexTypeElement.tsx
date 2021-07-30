import { FC, useCallback, useContext, useEffect, useState } from 'react';
import Chip from '@material-ui/core/Chip';
import { IndexHttp } from '../../http/Index';
import { IndexState } from '../../types/Milvus';
import {
  FieldView,
  IndexCreateParam,
  IndexManageParam,
  ParamPair,
} from './Types';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import icons from '../../components/icons/Icons';
import { rootContext } from '../../context/Root';
import CreateIndex from './Create';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';
import CustomLinearProgress from '../../components/customProgress/CustomLinearProgress';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingLeft: theme.spacing(1),
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',

    fontSize: '14px',
    color: theme.palette.primary.main,

    '&:hover': {
      cursor: 'pointer',
    },
  },
  btnDisabled: {
    color: '#82838e',
    pointerEvents: 'none',

    '&:hover': {
      cursor: 'default',
    },
  },
  chip: {
    height: '24px',
    backgroundColor: '#e9e9ed',
    padding: theme.spacing(0.5),

    '& .icon': {
      width: '16px',
      height: '16px',
    },
  },
  chipLabel: {
    fontSize: '12px',
    lineHeight: '16px',
  },
  addIcon: {
    width: '20px',
    height: '20px',
  },
}));

let timer: NodeJS.Timeout | null = null;

const IndexTypeElement: FC<{
  data: FieldView;
  collectionName: string;
  cb: (collectionName: string) => void;
}> = ({ data, collectionName, cb }) => {
  const classes = useStyles();
  // set in progress as defalut status
  const [status, setStatus] = useState<string>(IndexState.InProgress);

  const { t: indexTrans } = useTranslation('index');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');

  const [createProgress, setCreateProgress] = useState<number>(0);

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  const AddIcon = icons.add;
  const DeleteIcon = icons.delete;

  const fetchStatus = useCallback(async () => {
    if (data._indexType !== '') {
      const { state: status } = await IndexHttp.getIndexStatus(
        collectionName,
        data._fieldName
      );
      setStatus(status);
    }
  }, [collectionName, data._fieldName, data._indexType]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const fetchProgress = useCallback(() => {
    if (timer) {
      clearTimeout(timer);
    }
    if (data._indexType !== '' && status === IndexState.InProgress) {
      timer = setTimeout(async () => {
        const res = await IndexHttp.getIndexBuildProgress(
          collectionName,
          data._fieldName
        );

        const { indexed_rows, total_rows } = res;
        const percent = Number(indexed_rows) / Number(total_rows);
        const value = Math.floor(percent * 100);
        setCreateProgress(value);

        if (value !== 100) {
          fetchProgress();
        } else {
          console.log(
            '--- percent value:',
            value,
            'indexed rows',
            indexed_rows,
            'total_rows',
            total_rows
          );
          timer && clearTimeout(timer);
          // reset build progress
          setCreateProgress(0);
          // change index create status
          setStatus(IndexState.Finished);
        }
      }, 500);
    }
  }, [collectionName, data._fieldName, status, data._indexType]);

  // get index build progress
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const requestCreateIndex = async (params: ParamPair[]) => {
    const indexCreateParam: IndexCreateParam = {
      collection_name: collectionName,
      field_name: data._fieldName,
      extra_params: params,
    };
    await IndexHttp.createIndex(indexCreateParam);
    handleCloseDialog();
    openSnackBar(indexTrans('createSuccess'));
    cb(collectionName);
  };

  const handleCreate = () => {
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <CreateIndex
            collectionName={collectionName}
            fieldType={data._fieldType}
            handleCancel={handleCloseDialog}
            handleCreate={requestCreateIndex}
          />
        ),
      },
    });
  };

  const requestDeleteIndex = async () => {
    const indexDeleteParam: IndexManageParam = {
      collection_name: collectionName,
      field_name: data._fieldName,
    };

    await IndexHttp.deleteIndex(indexDeleteParam);
    handleCloseDialog();
    openSnackBar(successTrans('delete', { name: indexTrans('index') }));
    cb(collectionName);
  };

  const handleDelete = () => {
    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <DeleteTemplate
            label={btnTrans('delete')}
            title={dialogTrans('deleteTitle', { type: indexTrans('index') })}
            text={indexTrans('deleteWarning')}
            handleDelete={requestDeleteIndex}
          />
        ),
      },
    });
  };

  const generateElement = () => {
    if (
      data._fieldType !== 'BinaryVector' &&
      data._fieldType !== 'FloatVector'
    ) {
      return <div className={classes.item}>--</div>;
    }

    switch (data._indexType) {
      case '': {
        return (
          <div
            role="button"
            onClick={handleCreate}
            className={`${classes.btn} ${
              data._createIndexDisabled ? classes.btnDisabled : ''
            }`}
          >
            <AddIcon classes={{ root: classes.addIcon }} />
            {indexTrans('create')}
          </div>
        );
      }
      default: {
        return status === IndexState.InProgress ? (
          <CustomLinearProgress
            value={createProgress}
            tooltip={indexTrans('creating')}
          />
        ) : (
          <Chip
            label={data._indexType}
            classes={{ root: classes.chip, label: classes.chipLabel }}
            deleteIcon={<DeleteIcon classes={{ root: 'icon' }} />}
            onDelete={handleDelete}
          />
        );
      }
    }
  };

  return <>{generateElement()}</>;
};

export default IndexTypeElement;
