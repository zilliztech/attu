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
import Status from '../../components/status/Status';
import { PartitionHttp } from '../../http/Partition';

enum TAB_EMUM {
  'partition',
  'structure',
}

const Collection = () => {
  const { collectionName = '' } =
    useParams<{
      collectionName: string;
    }>();

  useNavigationHook(ALL_ROUTER_TYPES.COLLECTION_DETAIL, { collectionName });
  const [partitions, setPartitions] = useState<PartitionView[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const history = useHistory();
  const location = useLocation();

  const { t } = useTranslation('collection');

  const activeTabIndex = useMemo(() => {
    const { activeIndex } = location.search
      ? parseLocationSearch(location.search)
      : { activeIndex: TAB_EMUM.partition };
    return Number(activeIndex);
  }, [location, TAB_EMUM]);

  const handleTabChange = (activeIndex: number) => {
    const path = location.pathname;
    history.push(`${path}?activeIndex=${activeIndex}`);

    // fetch data
    if (activeIndex === TAB_EMUM.partition) {
      fetchPartitions(collectionName);
    }
  };

  const fetchPartitions = async (collectionName: string) => {
    const res = await PartitionHttp.getPartitions(collectionName);

    const partitons: PartitionView[] = res.map(p =>
      Object.assign(p, { _statusElement: <Status status={p._status} /> })
    );
    setLoading(false);
    setPartitions(partitons);
  };

  useEffect(() => {
    fetchPartitions(collectionName);
  }, [collectionName]);

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
