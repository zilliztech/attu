import { FC, useCallback, useContext, useEffect, useState } from 'react';
import Chip from '@material-ui/core/Chip';
import CustomButton from '../../components/customButton/CustomButton';
import { IndexHttp } from '../../http/Index';
import { IndexState } from '../../types/Milvus';
import {
  FieldView,
  IndexCreateParam,
  IndexManageParam,
  ParamPair,
} from './Types';
import StatusIcon from '../../components/status/StatusIcon';
import { ChildrenStatusType } from '../../components/status/Types';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import icons from '../../components/icons/Icons';
import { rootContext } from '../../context/Root';
import CreateIndex from './Create';
import DeleteTemplate from '../../components/customDialog/DeleteDialogTemplate';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingLeft: theme.spacing(1),
  },
  btn: {
    '& span': {
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    },
  },
  chip: {
    backgroundColor: '#e9e9ed',
  },
}));

const IndexTypeElement: FC<{
  data: FieldView;
  collectionName: string;
  cb: (collectionName: string) => void;
}> = ({ data, collectionName, cb }) => {
  const classes = useStyles();

  const [status, setStatus] = useState<string>('');

  const { t } = useTranslation('index');
  const { t: btnTrans } = useTranslation('btn');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  const AddIcon = icons.add;
  const DeleteIcon = icons.delete;

  const fetchStatus = useCallback(async () => {
    if (data._indexType !== '') {
      const status = await IndexHttp.getIndexStatus(
        collectionName,
        data._fieldName
      );
      setStatus(status);
    }
  }, [collectionName, data._fieldName, data._indexType]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const requestCreateIndex = async (params: ParamPair[]) => {
    const indexCreateParam: IndexCreateParam = {
      collection_name: collectionName,
      field_name: data._fieldName,
      extra_params: params,
    };
    await IndexHttp.createIndex(indexCreateParam);
    handleCloseDialog();
    openSnackBar(t('createSuccess'));
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
    openSnackBar(successTrans('delete', { name: t('index') }));
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
            title={dialogTrans('deleteTitle', { type: t('index') })}
            text={t('deleteWarning')}
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
          <CustomButton
            disabled={data._createIndexDisabled}
            className={classes.btn}
            onClick={handleCreate}
          >
            <AddIcon />
            {t('create')}
          </CustomButton>
        );
      }
      default: {
        return status === IndexState.InProgress ? (
          <StatusIcon type={ChildrenStatusType.CREATING} />
        ) : (
          <Chip
            label={data._indexType}
            classes={{ root: classes.chip }}
            deleteIcon={<DeleteIcon />}
            onDelete={handleDelete}
          />
        );
      }
    }
  };

  return <>{generateElement()}</>;
};

export default IndexTypeElement;
