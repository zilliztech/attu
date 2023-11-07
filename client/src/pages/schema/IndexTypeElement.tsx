import { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Chip from '@material-ui/core/Chip';
import { makeStyles, Theme } from '@material-ui/core';
import {
  FieldView,
  IndexCreateParam,
  IndexExtraParam,
  IndexManageParam,
} from './Types';
import { IndexHttp } from '@/http';
import { rootContext } from '@/context';
import icons from '@/components/icons/Icons';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import StatusIcon from '@/components/status/StatusIcon';
import { ChildrenStatusType } from '@/components/status/Types';
import { sleep } from '@/utils';
import CreateIndex from './Create';
import { IndexState } from '../../types/Milvus';
import { NONE_INDEXABLE_DATA_TYPES } from '@/consts';

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
    color: theme.palette.attuGrey.dark,
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

const IndexTypeElement: FC<{
  data: FieldView;
  collectionName: string;
  cb: (collectionName: string) => void;
}> = ({ data, collectionName, cb }) => {
  const classes = useStyles();
  // set empty string as default status
  const [status, setStatus] = useState<string>(IndexState.Default);
  const { t: indexTrans } = useTranslation('index');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');

  // const [createProgress, setCreateProgress] = useState<number>(0);

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  const AddIcon = icons.add;
  const DeleteIcon = icons.delete;

  const isIndexCreating: boolean = useMemo(
    () => status === IndexState.InProgress || status === IndexState.Unissued,
    [status]
  );

  useEffect(() => {
    let running = true;

    // define async data getter
    const fetchStatus = async (
      collectionName: string,
      fieldName: string,
      indexName: string
    ) => {
      // get fetch data
      const index_descriptions = await IndexHttp.getIndexInfo(collectionName);

      const indexDescription = index_descriptions.find(
        i => i.field_name === fieldName
      );

      if (
        indexDescription &&
        indexDescription.state !== IndexState.Finished &&
        running
      ) {
        // if not finished, sleep 3s
        await sleep(3000);
        // call self again
        fetchStatus(collectionName, fieldName, indexName);
      }

      // update state
      if (indexDescription) {
        setStatus(indexDescription.state);
      }
    };
    // prevent delete index trigger fetching index status
    if (data._indexType !== '' && status !== IndexState.Delete) {
      fetchStatus(collectionName, data._fieldName, data._indexName);
    }

    return () => {
      running = false;
    };
  }, [collectionName, data._indexType, data._fieldName, data._indexName]);

  const requestCreateIndex = async (
    params: IndexExtraParam,
    index_name: string
  ) => {
    const indexCreateParam: IndexCreateParam = {
      collection_name: collectionName,
      field_name: data._fieldName,
      index_name,
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
            dimension={Number(data._dimension)}
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
      index_name: data._indexName,
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
            label={btnTrans('drop')}
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
      data._isPrimaryKey ||
      NONE_INDEXABLE_DATA_TYPES.indexOf(data._fieldType) !== -1
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
        if (
          status === IndexState.Default ||
          status === IndexState.Delete ||
          isIndexCreating
        ) {
          return <StatusIcon type={ChildrenStatusType.CREATING} />;
        }

        /**
         * if creating finished, show chip that contains index type
         */
        return (
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
