import { Box, Typography, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import {
  MILVUS_SOURCE_CODE,
  MILVUS_DOCS,
  MILVUS_DISCORD,
  MILVUS_OFFICE_HOURS,
} from '@/consts/link';
import Icons from '@/components/icons/Icons';
import { authContext } from '@/context';

const CommunityLinks = () => {
  const { t } = useTranslation();
  const { isManaged } = useContext(authContext);

  const links = isManaged
    ? [
        {
          title: t('attu.docs'),
          url: 'https://docs.zilliz.com/docs/home',
          icon: <Icons.file sx={{ fontSize: 20 }} />,
        },
        {
          title: 'Support',
          url: 'https://support.zilliz.com/hc/en-us',
          icon: <Icons.question sx={{ fontSize: 20 }} />,
        },
        {
          title: 'Pricing',
          url: 'https://zilliz.com/pricing',
          icon: <Icons.link sx={{ fontSize: 20 }} />,
        },
        {
          title: t('attu.discord'),
          url: MILVUS_DISCORD,
          icon: <Icons.discord sx={{ fontSize: 20 }} />,
        },
      ]
    : [
        {
          title: t('attu.fileMilvusIssue'),
          url: MILVUS_SOURCE_CODE,
          icon: <Icons.github sx={{ fontSize: 20 }} />,
        },
        {
          title: t('attu.docs'),
          url: MILVUS_DOCS,
          icon: <Icons.file sx={{ fontSize: 20 }} />,
        },
        {
          title: t('attu.discord'),
          url: MILVUS_DISCORD,
          icon: <Icons.discord sx={{ fontSize: 20 }} />,
        },
        {
          title: t('attu.officeHours'),
          url: MILVUS_OFFICE_HOURS,
          icon: <Icons.calendar sx={{ fontSize: 20 }} />,
        },
      ];

  return (
    <Box
      sx={{
        width: 270,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        p: 1.5,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 1.5,
          fontSize: 16,
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        {isManaged ? 'Zilliz Cloud' : t('attu.community')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {links.map(link => (
          <Link
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': {
                color: 'primary.main',
                '& .MuiSvgIcon-root': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 1,
                backgroundColor: 'action.hover',
                color: 'text.secondary',
              }}
            >
              {link.icon}
            </Box>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {link.title}
            </Typography>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default CommunityLinks;
