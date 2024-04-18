import { FC, useContext, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Chip from '@material-ui/core/Chip';
import { makeStyles, Theme, Tooltip } from '@material-ui/core';
import { IndexCreateParam, IndexExtraParam, IndexManageParam } from './Types';
import { rootContext, dataContext } from '@/context';
import Icons from '@/components/icons/Icons';
import DeleteTemplate from '@/components/customDialog/DeleteDialogTemplate';
import StatusIcon, { LoadingType } from '@/components/status/StatusIcon';
import { IndexState } from '@/types/Milvus';
import {
  NONE_INDEXABLE_DATA_TYPES,
  DataTypeStringEnum,
  DataTypeEnum,
} from '@/consts';
import CreateIndex from './Create';
import { FieldObject } from '@server/types';
import CustomButton from '@/components/customButton/CustomButton';

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
    height: 24,
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
    background: `rgba(0, 0, 0, 0.04)`,
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
}> = ({ field, collectionName, cb, disabled, disabledTooltip }) => {
  const { createIndex, dropIndex } = useContext(dataContext);

  const classes = useStyles();
  // set empty string as default status
  const { t: indexTrans } = useTranslation('index');
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: successTrans } = useTranslation('success');
  const { t: collectionTrans } = useTranslation('collection');
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
          <CreateIndex
            collectionName={collectionName}
            fieldName={field.name}
            dataType={field.dataType as unknown as DataTypeEnum}
            fieldType={field.data_type as DataTypeStringEnum}
            dimension={Number(field.dimension)}
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

  const generateElement = () => {
    if (
      field.is_primary_key ||
      NONE_INDEXABLE_DATA_TYPES.indexOf(
        field.data_type as DataTypeStringEnum
      ) !== -1
    ) {
      return <div className={classes.item}>--</div>;
    }

    if (!field.index) {
      return (
        <CustomButton
          startIcon={<Icons.add />}
          className={classes.btn}
          tooltip={collectionTrans('clickToCreateVectorIndex')}
          onClick={e => handleCreate(e)}
        >
          {btnTrans('createIndex')}
        </CustomButton>
      );
    }
    // indexType example: FLAT
    switch (field.index.indexType) {
      default: {
        if (field.index.state === IndexState.InProgress) {
          return <StatusIcon type={LoadingType.CREATING} />;
        }

        const chipComp = () => (
          <Chip
            label={field.index.indexType}
            classes={{ root: classes.chip, label: classes.chipLabel }}
            deleteIcon={<Icons.delete classes={{ root: 'icon' }} />}
            onDelete={handleDelete}
            disabled={disabled}
            onClick={(e: MouseEvent<HTMLDivElement>) => {
              e.stopPropagation();
              handleDelete();
            }}
            size="small"
          />
        );
        /**
         * if creating finished, show chip that contains index type
         */
        return disabled ? (
          <Tooltip
            interactive
            arrow
            title={disabledTooltip ?? ''}
            placement={'top'}
          >
            <div>{chipComp()}</div>
          </Tooltip>
        ) : (
          <div>{chipComp()}</div>
        );
      }
    }
  };

  return <div className={classes.wrapper}>{generateElement()}</div>;
};

export default IndexTypeElement;
