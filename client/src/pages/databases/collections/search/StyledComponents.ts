import { styled } from '@mui/material/styles';
import { Box, Paper, Accordion, AccordionDetails, Button } from '@mui/material';

export const SearchRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

export const InputArea = styled(Box)({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '100%',
  padding: 0,
  overflow: 'hidden',
});

export const LeftSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  paddingRight: '8px',
  marginBottom: '8px',
  borderRight: `1px solid ${theme.palette.divider}`,
}));

export const AccordionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '260px',
  flexDirection: 'column',
  flexShrink: 0,
  overflow: 'auto',
  maxHeight: '100%',
  '& .MuiAccordion-root.Mui-expanded': {
    margin: 0,
  },
  '& .MuiAccordion-root.Mui-expanded:before': {
    opacity: 1,
  },
}));

export const StyledAccordion = styled(Accordion)(({ theme }) => ({
  boxShadow: 'none',
  padding: '0',

  '&.highlight': {
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: 4,
  },

  '& .MuiAccordionSummary-root': {
    minHeight: '48px',
    height: '48px',
    padding: '0 12px 0 0',
    transition: 'none',
    '&.Mui-expanded': {
      minHeight: '48px',
      height: '48px',
      margin: 0,
    },
    '& .MuiAccordionSummary-expandIcon': {
      padding: 4,
      alignSelf: 'flex-start',
      position: 'relative',
      top: '4px',
    },
    '& .MuiAccordionSummary-content': {
      margin: 0,
      padding: '8px 0',
      '&.Mui-expanded': {
        margin: 0,
      },
    },
  },
  '& .MuiAccordionSummary-content': {
    margin: 0,
    padding: '8px 0',
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  '& .MuiAccordionSummary-expandIcon': {
    alignSelf: 'flex-start',
    position: 'relative',
    top: '4px',
  },
}));

export const StyledAccordionDetails = styled(AccordionDetails)({
  display: 'flex',
  flexDirection: 'column',
  padding: '0',
  '& .textarea': {
    height: '100px',
    marginBottom: '8px',
  },
  '& .paramsWrapper': {
    '& .MuiFormControl-root': {
      width: '100%',
    },
  },
});

export const SearchInputBox = styled(Box)(({ theme }) => ({
  height: '124px',
  margin: '0 0 8px 0',
  overflow: 'auto',
  cursor: 'text',
}));

export const SearchControls = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: 120,
  minWidth: 120,
  padding: '0',
  height: 'fit-content',
  alignSelf: 'flex-start',
  marginLeft: '8px',
  '& .selector': {
    marginBottom: '8px',
  },
  '& span button': {
    width: '100%',
    height: '100%',
  },
}));

export const SearchResults = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  paddingLeft: 8,
  overflow: 'hidden',
});

export const Toolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(0, 0, 1),
  gap: theme.spacing(1),

  '& .left': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
    flex: 1,

    '& .textarea': {
      width: '100%',
      '& .MuiFormHelperText-root': {
        display: 'none',
      },
    },
  },

  '& .right': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
}));

export const StyledButton = styled(Button)({
  height: 56,
  width: 80,
});

export const Explorer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
  flexGrow: 1,
});

export const CloseButton = styled(Button)({
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 1,
  padding: '4px 8px',
});

export const ResetButton = styled(Button)({
  position: 'absolute',
  top: 8,
  left: 90,
  zIndex: 1,
  padding: '4px 8px',
});

export const NodeInfo = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '8px',
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 4,
  maxWidth: 240,
  overflow: 'auto',
  zIndex: 1,
  '& .wrapper': {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
    '& img': {
      display: 'inline-block',
      maxWidth: 120,
      maxHeight: 120,
      objectFit: 'contain',
    },
  },
  '& .tip': {
    color: theme.palette.text.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
}));

export const SelectedNodes = styled(Box)(({ theme }) => ({
  position: 'fixed',
  display: 'flex',
  flexDirection: 'column',
  top: 200,
  right: 36,
  borderRadius: 4,
  gap: 8,
  height: '70%',
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  '& .nodeInfo': {
    boxShadow: 'none',
    flexShrink: 0,
  },
}));

export const CheckboxRow = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  '& .MuiCheckbox-root': {
    padding: 0,
    marginRight: 4,
    alignSelf: 'flex-start',
    position: 'relative',
    top: '2px',
  },
  '& .label': {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  '& .field-name': {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '20px',
    wordBreak: 'break-all',
    '&.bold': {
      fontWeight: 600,
    },
  },
  '& .vector-type': {
    color: theme.palette.text.secondary,
    fontSize: '12px',
    lineHeight: '20px',
    '& i': {
      marginLeft: '4px',
      fontSize: '9px',
      fontWeight: 600,
      color: theme.palette.secondary.main,
    },
  },
}));

export const DataExplorerRoot = styled(Box)(({ theme }) => ({
  '& .nodeInfo': {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 4,
    maxWidth: 240,
    overflow: 'auto',
    zIndex: 1,
    '& .wrapper': {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      justifyContent: 'center',
      '& img': {
        display: 'inline-block',
        maxWidth: 120,
        maxHeight: 120,
        objectFit: 'contain',
      },
    },
    '& .tip': {
      color: theme.palette.text.secondary,
      fontSize: 12,
      textAlign: 'center',
    },
  },
}));
