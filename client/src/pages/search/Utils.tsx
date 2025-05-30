import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

export const getLabelDisplayedRows =
  (itemName: string = 'rows', info: string | ReactNode = '') =>
  ({ from = 0, to = 0, count = 0 }) => {
    const { t: commonTrans } = useTranslation();

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.75rem',
          lineHeight: 1,
          height: '20px',
        }}
      >
        <span style={{ fontSize: 'inherit' }}>
          {from} - {to}
        </span>
        <span style={{ fontSize: 'inherit' }}>
          {commonTrans('grid.of')} {count} {itemName}
        </span>
        {info && (
          <span
            style={{
              fontSize: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {info}
          </span>
        )}
      </div>
    );
  };
