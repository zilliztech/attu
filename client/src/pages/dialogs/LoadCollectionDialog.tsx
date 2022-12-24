import { useEffect, useState, useContext, useMemo } from 'react';
import {
  Typography,
  makeStyles,
  Theme,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CollectionHttp } from '../../http/Collection';
import { rootContext } from '../../context/Root';
import { useFormValidation } from '../../hooks/Form';
import { formatForm } from '../../utils/Form';
import { parseJson, getNode } from '../../utils/Metric';
import CustomInput from '../../components/customInput/CustomInput';
import { ITextfieldConfig } from '../../components/customInput/Types';
import DialogTemplate from '../../components/customDialog/DialogTemplate';
import { MilvusHttp } from '../../http/Milvus';
import CustomToolTip from '../../components/customToolTip/CustomToolTip';
import { MILVUS_NODE_TYPE, MILVUS_DEPLOY_MODE } from '../../consts/Milvus';
import icons from '../../components/icons/Icons';

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
    fontSize: '20px',
    marginLeft: theme.spacing(0.5),
  },
}));

const LoadCollectionDialog = (props: any) => {
  const classes = useStyles();
  const { collection, onLoad } = props;
  const { t: dialogTrans } = useTranslation('dialog');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: btnTrans } = useTranslation('btn');
  const { t: warningTrans } = useTranslation('warning');
  const { handleCloseDialog } = useContext(rootContext);
  const [form, setForm] = useState({
    replica: 0,
  });
  const [enableRelica, setEnableRelica] = useState(false);
  const [replicaToggle, setReplicaToggle] = useState(false);
  const [maxQueryNode, setMaxQueryNode] = useState(1);

  // check if it is cluster
  useEffect(() => {
    async function fetchData() {
      const res = await MilvusHttp.getMetrics();
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
      if (enableRelica && queryNodes.length > 1) {
        setForm({
          replica: queryNodes.length,
        });
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
    await CollectionHttp.loadCollection(collection, params);

    // callback
    onLoad && onLoad();
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
  };

  const InfoIcon = icons.info;

  return (
    <DialogTemplate
      title={dialogTrans('loadTitle', {
        type: collection,
      })}
      handleClose={handleCloseDialog}
      children={
        <>
          <Typography variant="body1" component="p" className={classes.desc}>
            {collectionTrans('loadContent')}
          </Typography>
          {enableRelica ? (
            <>
              <FormControlLabel
                control={
                  <Switch checked={replicaToggle} onChange={handleChange} />
                }
                label={
                  <CustomToolTip title={collectionTrans('replicaDes')}>
                    <>
                      {collectionTrans('enableRepica')}
                      <InfoIcon classes={{ root: classes.icon }} />
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
