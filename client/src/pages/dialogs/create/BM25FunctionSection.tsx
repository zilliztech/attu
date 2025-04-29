import { FC } from 'react';
import {
  Typography,
  Button,
  Box,
  List,
  IconButton,
  Paper,
  Stack,
  Chip,
  Tooltip,
} from '@mui/material';
import CustomSelector from '@/components/customSelector/CustomSelector';
import Icons from '@/components/icons/Icons';
import type { CreateField } from '../../databases/collections/Types';
export interface BM25Function {
  name: string;
  description: string;
  type: any;
  input_field_names: string[];
  output_field_names: string[];
  params: Record<string, any>;
}

interface BM25FunctionSectionProps {
  showBm25Selection: boolean;
  varcharFields: CreateField[];
  sparseFields: CreateField[];
  selectedBm25Input: string;
  selectedBm25Output: string;
  setSelectedBm25Input: (val: string) => void;
  setSelectedBm25Output: (val: string) => void;
  handleAddBm25Click: () => void;
  handleConfirmAddBm25: () => void;
  handleCancelAddBm25: () => void;
  formFunctions: BM25Function[];
  setForm: (updater: (prev: any) => any) => void;
  collectionTrans: any;
  btnTrans: any;
}

const BM25FunctionSection: FC<BM25FunctionSectionProps> = ({
  showBm25Selection,
  varcharFields,
  sparseFields,
  selectedBm25Input,
  selectedBm25Output,
  setSelectedBm25Input,
  setSelectedBm25Output,
  handleAddBm25Click,
  handleConfirmAddBm25,
  handleCancelAddBm25,
  formFunctions,
  setForm,
  collectionTrans,
  btnTrans,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {!showBm25Selection && (
        <Tooltip
          title={
            varcharFields.length === 0 && sparseFields.length === 0
              ? collectionTrans('bm25NoVarcharAndSparse')
              : varcharFields.length === 0
                ? collectionTrans('bm25NoVarchar')
                : sparseFields.length === 0
                  ? collectionTrans('bm25NoSparse')
                  : ''
          }
          placement="top"
          arrow
          disableHoverListener={
            !(varcharFields.length === 0 || sparseFields.length === 0)
          }
        >
          <span>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Icons.add />}
              onClick={handleAddBm25Click}
              sx={{
                width: '100%',
              }}
              disabled={varcharFields.length === 0 || sparseFields.length === 0}
            >
              {collectionTrans('addBm25Function')}
            </Button>
          </span>
        </Tooltip>
      )}

      {showBm25Selection && (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <CustomSelector
            label={collectionTrans('bm25InputVarChar')}
            value={selectedBm25Input}
            onChange={e => setSelectedBm25Input(e.target.value as string)}
            variant="filled"
            size="small"
            sx={{ minWidth: 200 }}
            options={varcharFields.map(field => ({
              label: field.name,
              value: field.name,
            }))}
          />

          <Typography sx={{ mx: 1 }}>→</Typography>

          <CustomSelector
            label={collectionTrans('bm25OutputSparse')}
            value={selectedBm25Output}
            onChange={e => setSelectedBm25Output(e.target.value as string)}
            variant="filled"
            size="small"
            sx={{ minWidth: 200 }}
            options={sparseFields.map(field => ({
              label: field.name,
              value: field.name,
            }))}
          />

          <Button
            variant="contained"
            size="small"
            onClick={handleConfirmAddBm25}
            disabled={!selectedBm25Input || !selectedBm25Output}
            sx={{ ml: 1 }}
          >
            {btnTrans('confirm')}
          </Button>
          <Button variant="text" size="small" onClick={handleCancelAddBm25}>
            {btnTrans('cancel')}
          </Button>
        </Box>
      )}

      {formFunctions && formFunctions.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <List dense>
            {formFunctions.map((func, index) => (
              <Paper key={index} sx={{ mb: 1, p: 1, position: 'relative' }}>
                <IconButton
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                  onClick={() => {
                    setForm(prev => ({
                      ...prev,
                      functions: prev.functions?.filter(
                        (_: any, i: number) => i !== index
                      ),
                    }));
                  }}
                >
                  <Icons.delete fontSize="small" />
                </IconButton>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {func.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {func.description}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {func.input_field_names.map(name => (
                      <Chip
                        key={name}
                        label={name}
                        size="small"
                        color="primary"
                      />
                    ))}
                    <Typography variant="body2">→</Typography>
                    {func.output_field_names.map(name => (
                      <Chip
                        key={name}
                        label={name}
                        size="small"
                        color="success"
                      />
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default BM25FunctionSection;
