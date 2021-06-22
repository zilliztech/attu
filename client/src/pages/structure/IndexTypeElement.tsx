import { FC, useCallback, useContext, useEffect, useState } from 'react';
import Chip from '@material-ui/core/Chip';
import CustomButton from '../../components/customButton/CustomButton';
import { IndexHttp } from '../../http/Index';
import { IndexState } from '../../types/Milvus';
import { FieldView, IndexCreateParam, ParamPair } from './Types';
import StatusIcon from '../../components/status/StatusIcon';
import { ChildrenStatusType } from '../../components/status/Types';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import icons from '../../components/icons/Icons';
import { rootContext } from '../../context/Root';
import CreateIndex from './Create';
import { ManageRequestMethods } from '../../types/Common';

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
  createCb: (collectionName: string) => void;
}> = ({ data, collectionName, createCb }) => {
  const classes = useStyles();

  const [status, setStatus] = useState<string>('');
  const { t } = useTranslation('index');

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
      type: ManageRequestMethods.CREATE,
      collection_name: collectionName,
      field_name: data._fieldName,
      extra_params: params,
    };
    await IndexHttp.createIndex(indexCreateParam);
    handleCloseDialog();
    openSnackBar(t('createSuccess'));
    createCb(collectionName);
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

  const handleDelete = () => {};

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
