import { FC, useCallback, useEffect, useState } from 'react';
import Chip from '@material-ui/core/Chip';
import CustomButton from '../../components/customButton/CustomButton';
import { IndexHttp } from '../../http/Index';
import { IndexState } from '../../types/Milvus';
import { FieldView } from './Types';
import StatusIcon from '../../components/status/StatusIcon';
import { ChildrenStatusType } from '../../components/status/Types';
import { useTranslation } from 'react-i18next';
import { makeStyles, Theme } from '@material-ui/core';
import icons from '../../components/icons/Icons';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingLeft: theme.spacing(1),
  },
  btn: {
    '& span': {
      textTransform: 'uppercase',
    },
  },
  chip: {
    backgroundColor: '#e9e9ed',
  },
}));

const IndexTypeElement: FC<{ data: FieldView; collectionName: string }> = ({
  data,
  collectionName,
}) => {
  const classes = useStyles();

  const [status, setStatus] = useState<string>('');
  const { t } = useTranslation('index');

  const AddIcon = icons.add;
  const DeleteIcon = icons.delete;

  const fetchStatus = useCallback(async () => {
    const status = await IndexHttp.getIndexStatus(
      collectionName,
      data._fieldName
    );
    setStatus(status);
  }, [collectionName, data._fieldName]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleCreate = () => {};

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
