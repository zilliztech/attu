import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Typography } from '@mui/material';
import CustomSelector from '@/components/customSelector/CustomSelector';
import Uploader from '@/components/uploader/Uploader';
import { INSERT_MAX_SIZE } from '@/consts';
import { parseByte } from '@/utils';
import type { InsertImportProps } from './Types';
import Box from '@mui/material/Box';

const InsertImport: FC<InsertImportProps> = ({
  collectionOptions,
  partitionOptions,
  selectedCollection,
  selectedPartition,
  handleCollectionChange,
  handlePartitionChange,
  handleUploadedData,
  handleUploadFileChange,
  fileName,
  setFileName,
}) => {
  const { t: insertTrans } = useTranslation('insert');
  const { t: collectionTrans } = useTranslation('collection');
  const { t: partitionTrans } = useTranslation('partition');

  return (
    <Box>
      <Typography
        sx={theme => ({
          color: theme.palette.text.primary,
          fontWeight: 500,
          mb: 1,
        })}
      >
        {insertTrans('targetTip')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box sx={{ flexBasis: '40%', minWidth: 256 }}>
            <CustomSelector
              options={collectionOptions}
              disabled={collectionOptions.length === 0}
              wrapperClass="selector"
              labelClass="selectLabel"
              value={selectedCollection}
              variant="filled"
              label={collectionTrans('collection')}
              onChange={(e: { target: { value: unknown } }) => {
                const collection = e.target.value;
                handleCollectionChange &&
                  handleCollectionChange(collection as string);
              }}
            />
          </Box>
          <Divider
            sx={theme => ({
              width: 20,
              mx: 4,
              bgcolor: theme.palette.text.secondary,
            })}
          />
          <Box sx={{ flexBasis: '40%', minWidth: 256 }}>
            <CustomSelector
              options={partitionOptions}
              disabled={partitionOptions.length === 0}
              wrapperClass="selector"
              labelClass="selectLabel"
              value={selectedPartition}
              variant="filled"
              label={partitionTrans('partition')}
              onChange={(e: { target: { value: unknown } }) => {
                const partition = e.target.value;
                handlePartitionChange(partition as string);
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={theme => ({
          mt: 3,
          p: 1,
          bgcolor: theme.palette.background.default,
        })}
      >
        <Typography
          sx={theme => ({ color: theme.palette.text.secondary, mb: 1 })}
          variant="body1"
        >
          {insertTrans('file')}
        </Typography>
        <Box
          sx={theme => ({
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${theme.palette.divider}`,
            p: 1,
            bgcolor: theme.palette.background.paper,
          })}
        >
          <Uploader
            btnClass="uploader"
            label={insertTrans('uploaderLabel')}
            accept=".csv,.json"
            disabled={!selectedCollection}
            disableTooltip={insertTrans('uploadFileDisableTooltip')}
            setFileName={setFileName}
            handleUploadedData={handleUploadedData}
            maxSize={parseByte(`${INSERT_MAX_SIZE}m`)}
            overSizeWarning={insertTrans('overSizeWarning', {
              size: INSERT_MAX_SIZE,
            })}
            handleUploadFileChange={handleUploadFileChange}
          />
          <Typography sx={theme => ({ color: theme.palette.text.secondary })}>
            {fileName || insertTrans('fileNamePlaceHolder')}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={theme => ({ color: theme.palette.text.secondary, mt: 1 })}
        >
          {insertTrans('noteTitle')}
        </Typography>
        <Box component="ul" sx={theme => ({ mt: 1, pl: 3 })}>
          {(insertTrans('notes', { returnObjects: true }) as string[]).map(
            (note: string) => (
              <Box component="li" key={note} sx={{ maxWidth: 560 }}>
                <Typography>{note}</Typography>
              </Box>
            )
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default InsertImport;
