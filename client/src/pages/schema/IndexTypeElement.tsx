import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Chip from '@material-ui/core/Chip';
import { IndexHttp } from '../../http/Index';
import { IndexState } from '../../types/Milvus';
import {
  FieldView,
  IndexCreateParam,
  IndexExtraParam,
  IndexManageParam,
} from './Types';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import icons from '../../components/icons/Icons';
import { rootContext } from '../../context/Root';
import CreateIndex from './Create';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';
import CustomLinearProgress from '../../components/customProgress/CustomLinearProgress';
import StatusIcon from '../../components/status/StatusIcon';
import { ChildrenStatusType } from '../../components/status/Types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    // give fixed width to prevent table cell stretching
    width: 150,
  },
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
  // set empty string as defalut status
  const [status, setStatus] = useState<string>(IndexState.Default);

  const { t: indexTrans } = useTranslation('index');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');

  const [createProgress, setCreateProgress] = useState<number>(0);

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  const AddIcon = icons.add;
  const DeleteIcon = icons.delete;

  const isIndexCreating: boolean = useMemo(
    () => status === IndexState.InProgress || status === IndexState.Unissued,
    [status]
  );

  const fetchStatus = useCallback(async () => {
    // prevent delete index trigger fetching index status
    if (data._indexType !== '' && status !== IndexState.Delete) {
      const { state: status } = await IndexHttp.getIndexStatus(
        collectionName,
        data._fieldName
      );
      setStatus(status);
    }
  }, [collectionName, data._fieldName, data._indexType, status]);

  const fetchProgress = useCallback(() => {
    if (timer) {
      clearTimeout(timer);
    }
    if (data._indexType !== '' && isIndexCreating) {
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
          timer && clearTimeout(timer);
          // reset build progress
          setCreateProgress(0);
          // change index create status
          setStatus(IndexState.Finished);
        }
      }, 500);
    }
  }, [collectionName, data._fieldName, isIndexCreating, data._indexType]);

  useEffect(() => {
    /**
     * fetch index status, then fetch index build progress
     */
    fetchStatus();
    fetchProgress();
  }, [fetchStatus, fetchProgress]);

  const requestCreateIndex = async (params: IndexExtraParam) => {
    const indexCreateParam: IndexCreateParam = {
      collection_name: collectionName,
      field_name: data._fieldName,
      extra_params: params,
    };
    await IndexHttp.createIndex(indexCreateParam);
    // reset status to default empty string
    setStatus(IndexState.Default);
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
            fieldName={data._fieldName}
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
    // use 'delete' as special status for whether fetching index status check
    setStatus(IndexState.Delete);
    cb(collectionName);
    handleCloseDialog();
    openSnackBar(successTrans('delete', { name: indexTrans('index') }));
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
    // only vector type field is able to create index
    if (
      data._fieldType !== 'BinaryVector' &&
      data._fieldType !== 'FloatVector'
    ) {
      return <div className={classes.item}>--</div>;
    }

    // _indexType example: FLAT
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
        /**
         * empty string or 'delete' means fetching progress hasn't finished
         * show loading animation for such situations
         */
        if (status === IndexState.Default || status === IndexState.Delete) {
          return <StatusIcon type={ChildrenStatusType.CREATING} />;
        }
        /**
         * if creating not finished, show progress bar
         * if creating finished, show chip that contains index type
         */
        return isIndexCreating ? (
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

  return <div className={classes.wrapper}>{generateElement()}</div>;
};

export default IndexTypeElement;
