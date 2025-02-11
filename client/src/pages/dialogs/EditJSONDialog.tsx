import { FC, useEffect, useRef, useState } from 'react';
import { Theme, useTheme } from '@mui/material';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, ViewUpdate } from '@codemirror/view';
import { insertTab } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';
import { basicSetup } from 'codemirror';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { linter } from '@codemirror/lint';
import { useTranslation } from 'react-i18next';
import DialogTemplate from '@/components/customDialog/DialogTemplate';
import { makeStyles } from '@mui/styles';
import { githubLight } from '@ddietr/codemirror-themes/github-light';
import { githubDark } from '@ddietr/codemirror-themes/github-dark';

const useStyles = makeStyles((theme: Theme) => ({
  code: {
    border: `1px solid ${theme.palette.divider}`,
    overflow: 'auto',
  },
  tip: {
    fontSize: 12,
    marginBottom: 8,
    width: 480,
    lineHeight: '20px',
  },
}));

type EditJSONDialogProps = {
  data: { [key: string]: any };
  handleConfirm: (data: { [key: string]: any }) => void;
  handleCloseDialog: () => void;
  dialogTitle: string;
  dialogTip: string;
  cb?: () => void;
};

// json linter for cm
const linterExtension = linter(jsonParseLinter());

const EditJSONDialog: FC<EditJSONDialogProps> = props => {
  // hooks
  const theme = useTheme();
  const themeCompartment = new Compartment();

  // props
  const { data, handleCloseDialog, handleConfirm } = props;
  // UI states
  const [disabled, setDisabled] = useState(true);
  // translations
  const { t: btnTrans } = useTranslation('btn');
  // refs
  const editorEl = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();
  // styles
  const classes = useStyles();

  const originalData = JSON.stringify(data, null, 2) + '\n';

  // create editor
  useEffect(() => {
    if (!editor.current) {
      const startState = EditorState.create({
        doc: originalData,
        extensions: [
          basicSetup,
          json(),
          linterExtension,
          keymap.of([{ key: 'Tab', run: insertTab }]), // fix tab behaviour
          indentUnit.of('    '), // fix tab indentation
          EditorView.theme({
            '&.cm-editor': {
              '&.cm-focused': {
                outline: 'none',
              },
            },
            '.cm-content': {
              fontSize: '12px',
            },
            '.cm-tooltip-lint': {
              width: '80%',
            },
          }),
          themeCompartment.of(
            theme.palette.mode === 'light' ? githubLight : githubDark
          ),
          EditorView.lineWrapping,
          EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
            if (viewUpdate.docChanged) {
              const d = jsonParseLinter()(view);
              if (d.length !== 0) {
                setDisabled(true);
                return;
              }

              const doc = viewUpdate.state.doc;
              const value = doc.toString();

              setDisabled(value === originalData);
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: editorEl.current!,
      });

      editor.current = view;

      return () => {
        view.destroy();
        editor.current = undefined;
      };
    }
  }, [JSON.stringify(data)]);

  // handle confirm
  const _handleConfirm = async () => {
    handleConfirm(JSON.parse(editor.current!.state.doc.toString()));
    handleCloseDialog();
  };

  return (
    <DialogTemplate
      title={props.dialogTitle}
      handleClose={handleCloseDialog}
      children={
        <>
          <div
            className={classes.tip}
            dangerouslySetInnerHTML={{
              __html: props.dialogTip,
            }}
          ></div>
          <div
            className={`${classes.code} cm-editor`}
            ref={editorEl}
            onClick={() => {
              if (editor.current) editor.current.focus();
            }}
          ></div>
        </>
      }
      confirmDisabled={disabled}
      confirmLabel={btnTrans('edit')}
      handleConfirm={_handleConfirm}
      showCancel={true}
    />
  );
};

export default EditJSONDialog;
