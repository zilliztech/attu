import { useTranslation } from 'react-i18next';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import CustomTabList from '../../components/customTabList/CustomTabList';
import { ITab } from '../../components/customTabList/Types';
import Partitions from '../partitions/partitions';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { PartitionView } from '../partitions/Types';
import { parseLocationSearch } from '../../utils/Format';
import { StatusEnum } from '../../components/status/Types';
import Status from '../../components/status/Status';
import { formatNumber } from '../../utils/Common';

const Collection = () => {
  const { collectionName = '' } =
    useParams<{
      collectionName: string;
    }>();

  useNavigationHook(ALL_ROUTER_TYPES.COLLECTION_DETAIL, { collectionName });
  const [partitions, setPartitions] = useState<PartitionView[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const history = useHistory();
  const location = useLocation();

  const { t } = useTranslation('collection');

  enum TAB_EMUM {
    'partition',
    'structure',
  }

  const activeTabIndex = useMemo(() => {
    const { activeIndex } = location.search
      ? parseLocationSearch(location.search)
      : { activeIndex: TAB_EMUM.partition };
    return Number(activeIndex);
  }, [location, TAB_EMUM]);

  const handleTabChange = (activeIndex: number) => {
    const path = location.pathname;
    history.push(`${path}?activeIndex=${activeIndex}`);
  };

  useEffect(() => {
    const mockPartitions: PartitionView[] = [
      {
        id: '1',
        name: 'partition',
        status: StatusEnum.unloaded,
        statusElement: <Status status={StatusEnum.unloaded} />,
        rowCount: formatNumber(11223),
      },
    ];

    setPartitions(mockPartitions);
  }, []);

  const tabs: ITab[] = [
    {
      label: t('partitionTab'),
      component: <Partitions data={partitions} loading={loading} />,
    },
    {
      label: t('structureTab'),
      component: <section>structure section</section>,
    },
  ];

  return (
    <section className="page-wrapper">
      <CustomTabList
        tabs={tabs}
        activeIndex={activeTabIndex}
        handleTabChange={handleTabChange}
      />
    </section>
  );
};

export default Collection;
