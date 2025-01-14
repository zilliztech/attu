import { FC, useContext, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Chip from '@mui/material/Chip';
import { Theme, Tooltip } from '@mui/material';
import { IndexCreateParam, IndexExtraParam, IndexManageParam } from './Types';
import { rootContext, dataContext } from '@/context';
import Icons from '@/components/icons/Icons';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { IndexState } from '@/consts/Milvus';
import { NONE_INDEXABLE_DATA_TYPES, DataTypeStringEnum } from '@/consts';
import CreateIndexDialog from './CreateIndexDialog';
import CustomButton from '@/components/customButton/CustomButton';
import { makeStyles } from '@mui/styles';
import { isVectorType } from '@/utils';
import type { FieldObject } from '@server/types';

const useStyles = makeStyles((theme: Theme) => ({
  wrapper: {
    // give fixed width to prevent table cell stretching
    width: 'auto',
  },
  item: {
    paddingLeft: theme.spacing(1),
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    color: theme.palette.primary.main,
    height: 26,
    fontSize: 13,
    border: `1px solid transparent`,
    '&:hover': {
      cursor: 'pointer',
    },
    '&.outline': {
      border: `1px dashed ${theme.palette.primary.main}`,
    },
    '& svg': {
      width: 15,
    },
  },
  btnDisabled: {
    color: theme.palette.text.secondary,
    pointerEvents: 'none',

    '&:hover': {
      cursor: 'default',
    },
  },
  chip: {
    padding: theme.spacing(0.5),

    '& .icon': {
      width: '16px',
      height: '16px',
    },
  },
  chipLabel: {
    fontSize: '12px',
  },
  addIcon: {
    width: '20px',
    height: '20px',
  },
}));

const IndexTypeElement: FC<{
  field: FieldObject;
  collectionName: string;
  disabled?: boolean;
  disabledTooltip?: string;
  cb?: (collectionName: string) => void;
}> = ({ field, collectionName, cb, disabled }) => {
  const { createIndex, dropIndex } = useContext(dataContext);

  const classes = useStyles();
  // set empty string as default status
  const { t: indexTrans } = useTranslation('index');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: btnTrans } = useTranslation('btn');

  const { setDialog, handleCloseDialog, openSnackBar } =
    useContext(rootContext);

  const requestCreateIndex = async (
    params: IndexExtraParam,
    index_name: string
  ) => {
    const indexCreateParam: IndexCreateParam = {
      collection_name: collectionName,
      field_name: field.name,
      index_name,
      extra_params: params,
    };
    await createIndex(indexCreateParam);
    // reset status to default empty string
    handleCloseDialog();
    openSnackBar(indexTrans('createSuccess'));
    cb && (await cb(collectionName));
  };

  const handleCreate = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    setDialog({
      open: true,
      type: 'custom',
      params: {
        component: (
          <CreateIndexDialog
            collectionName={collectionName}
            field={field}
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
      field_name: field.name,
      index_name: field.index.index_name,
    };

    await dropIndex(indexDeleteParam);
    cb && (await cb(collectionName));
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

  const chipComp = (
    text = field.index.indexType,
    icon = <Icons.delete classes={{ root: 'icon' }} />,
    tooltip = ''
  ) => {
    const IndexElem = () => (
      <Chip
        label={text}
        classes={{ root: classes.chip, label: classes.chipLabel }}
        deleteIcon={icon}
        onDelete={handleDelete}
        disabled={disabled}
        onClick={e => {
          e.stopPropagation();
          handleDelete();
        }}
        size="small"
      />
    );

    return tooltip ? (
      <Tooltip arrow title={tooltip} placement="top">
        <div>
          <IndexElem />
        </div>
      </Tooltip>
    ) : (
      <IndexElem />
    );
  };

  const generateElement = () => {
    if (
      NONE_INDEXABLE_DATA_TYPES.indexOf(
        field.data_type as DataTypeStringEnum
      ) !== -1
    ) {
      return <div className={classes.item}>--</div>;
    }

    if (!field.index) {
      const isVector = isVectorType(field);
      return (
        <CustomButton
          startIcon={<Icons.addOutline />}
          className={`${classes.btn}${isVector ? ' outline' : ''}`}
          onClick={e => handleCreate(e)}
        >
          {btnTrans(isVector ? 'createVectorIndex' : 'createScalarIndex')}
        </CustomButton>
      );
    }
    // indexType example: FLAT
    switch (field.index.indexType) {
      default: {
        if (field.index.state === IndexState.InProgress) {
          return (
            <>
              {chipComp(
                field.index.indexType,
                <StatusIcon type={LoadingType.CREATING} />,
                indexTrans('cancelCreate')
              )}
            </>
          );
        }

        /**
         * if creating finished, show chip that contains index type
         */
        return chipComp(field.index.indexType);
      }
    }
  };

  return <div className={classes.wrapper}>{generateElement()}</div>;
};

export default IndexTypeElement;
