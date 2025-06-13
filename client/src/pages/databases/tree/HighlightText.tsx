import React from 'react';
import { useTheme } from '@mui/material/styles';

interface HighlightTextProps {
  text: string;
  highlight: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, highlight }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  if (!highlight.trim()) {
    return <>{text}</>;
  }
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            style={{
              backgroundColor: isLight
                ? theme.palette.highlight.light
                : theme.palette.highlight.dark,
              borderRadius: '2px',
              padding: '0 2px',
            }}
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export default HighlightText;
