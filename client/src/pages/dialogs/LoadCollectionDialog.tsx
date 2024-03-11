import { useEffect, useState, useContext, useMemo } from 'react';
import {
  Typography,
  makeStyles,
  Theme,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { authContext, rootContext, dataContext } from '@/context';
import { MilvusService } from '@/http';
import { useFormValidation } from '@/hooks';
import { formatForm, parseJson, getNode } from '@/utils';
import { MILVUS_NODE_TYPE, MILVUS_DEPLOY_MODE } from '@/consts';
import CustomInput from '@/components/customInput/CustomInput';
import { ITextfieldConfig } from '@/components/customInput/Types';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import CustomToolTip from '@/components/customToolTip/CustomToolTip';
import icons from '@/components/icons/Icons';

const useStyles = makeStyles((theme: Theme) => ({
  desc: {
    marginBottom: theme.spacing(2),
    maxWidth: 480,
  },
  replicaDesc: {
    marginBottom: theme.spacing(2),
    maxWidth: 480,
  },
  toggle: {
    marginBottom: theme.spacing(2),
  },
  icon: {
    fontSize: '14px',
    marginLeft: theme.spacing(0.5),
  },
}));

const LoadCollectionDialog = (props: any) => {
  const { loadCollection } = useContext(dataContext);
  const classes = useStyles();
  const { collectionName, onLoad } = props;
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const { handleCloseDialog } = useContext(rootContext);
  const [form, setForm] = useState({
    replica: 1,
  });
  const { isManaged } = useContext(authContext);

  const [enableRelica, setEnableRelica] = useState(false);
  const [replicaToggle, setReplicaToggle] = useState(false);
  const [maxQueryNode, setMaxQueryNode] = useState(1);

  // check if it is cluster
  useEffect(() => {
    async function fetchData() {
      const res = await MilvusService.getMetrics();
      const parsedJson = parseJson(res);
      // get root cord
      const rootCoords = getNode(
        parsedJson.workingNodes,
        MILVUS_NODE_TYPE.ROOTCOORD
      );
      // get query nodes
      const queryNodes = getNode(
        parsedJson.workingNodes,
        MILVUS_NODE_TYPE.QUERYNODE
      );

      const rootCoord = rootCoords[0];

      // should we show replic toggle
      const enableRelica =
        rootCoord.infos.system_info.deploy_mode ===
        MILVUS_DEPLOY_MODE.DISTRIBUTED;

      // only show replica toggle in distributed mode && query node > 1
      if (enableRelica && queryNodes.length > 1 && !isManaged) {
        setMaxQueryNode(queryNodes.length);
        setEnableRelica(enableRelica);
      }
    }
    fetchData();
  }, []);

  // input  state change
  const handleInputChange = (value: number) => {
    setForm({ replica: value });
  };
  // confirm action
  const handleConfirm = async () => {
    let params;

    if (enableRelica) {
      params = { replica_number: Number(form.replica) };
    }

    // load collection request
    await loadCollection(collectionName, params);

    // callback
    if (onLoad) {
      await onLoad(collectionName);
    }
    // close dialog
    handleCloseDialog();
  };

  // validator
  const checkedForm = useMemo(() => {
    return enableRelica ? [] : formatForm(form);
  }, [form, enableRelica]);

  // validate
  const { validation, checkIsValid, disabled } = useFormValidation(checkedForm);

  // input config
  const inputConfig: ITextfieldConfig = {
    label: collectionTrans('replicaNum'),
    type: 'number',
    key: 'replica',
    onChange: handleInputChange,
    variant: 'filled',
    placeholder: collectionTrans('replicaNum'),
    fullWidth: true,
    validations: [],
    required: enableRelica,
    defaultValue: form.replica,
  };

  // if replica is enabled, add validation
  if (enableRelica) {
    inputConfig.validations?.push(
      {
        rule: 'require',
        errorText: warningTrans('required', {
          name: collectionTrans('replicaNum'),
        }),
      },
      {
        rule: 'range',
        errorText: warningTrans('range', { min: 1, max: maxQueryNode }),
        extraParam: {
          min: 1,
          max: maxQueryNode,
          type: 'number',
        },
      }
    );
  }

  // toggle enbale replica
  const handleChange = () => {
    setReplicaToggle(!replicaToggle);
    if (!replicaToggle === false) {
      setForm({ replica: 1 });
    }
  };

  const QuestionIcon = icons.question;

  return (
    <DialogTemplate
      title={dialogTrans('loadTitle', {
        type: collectionName,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography variant="body1" component="p" className={classes.desc}>
            {collectionTrans('loadContent')}
          </Typography>
          {!enableRelica ? (
            <>
              <FormControlLabel
                control={
                  <Switch checked={replicaToggle} onChange={handleChange} />
                }
                label={
                  <CustomToolTip title={collectionTrans('replicaDes')}>
                    <>
                      {collectionTrans('enableRepica')}
                      <QuestionIcon classes={{ root: classes.icon }} />
                    </>
                  </CustomToolTip>
                }
                className={classes.toggle}
              />
            </>
          ) : null}
          {replicaToggle ? (
            <>
              <CustomInput
                type="text"
                textConfig={inputConfig}
                checkValid={checkIsValid}
                validInfo={validation}
              />
            </>
          ) : null}
        </>
      }
      confirmLabel={btnTrans('load')}
      handleConfirm={handleConfirm}
      confirmDisabled={replicaToggle ? disabled : false}
    />
  );
};

export default LoadCollectionDialog;
