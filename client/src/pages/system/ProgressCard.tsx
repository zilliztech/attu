
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import BaseCard from './BaseCard';
import Progress from './Progress';
import { getByteString } from '../../utils/Format';
import { ProgressCardProps } from './Types';

const color1 = '#06F3AF';
const color2 = '#635DCE';

const ProgressCard: FC<ProgressCardProps> = (props) => {
  const { title, total, usage } = props;
  const { t } = useTranslation('systemView');
  const { t: commonTrans } = useTranslation();
  const capacityTrans: { [key in string]: string } = commonTrans('capacity');

  const color = title === t('diskTitle') ? color1 : color2;
  const percent = (usage && total) ? (usage / total) : 0;

  return (
    <BaseCard title={title} content={`${getByteString(usage, total, capacityTrans)} (${Math.floor(percent * 100)}%)`}>
      <Progress percent={percent} color={color} />
    </BaseCard>
  );
};

export default ProgressCard;