import { useTranslation } from 'react-i18next';
import { useNavigationHook } from '../../hooks/Navigation';
import { ALL_ROUTER_TYPES } from '../../router/Types';
import CustomTabList from '../../components/customTabList/CustomTabList';
import { ITab } from '../../components/customTabList/Types';
import Partitions from '../partitions/Partitions';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { parseLocationSearch } from '../../utils/Format';
import Schema from '../schema/Schema';

enum TAB_EMUM {
  'schema',
  'partition',
}

const Collection = () => {
  const { collectionName = '' } = useParams<{
    collectionName: string;
  }>();

  useNavigationHook(ALL_ROUTER_TYPES.COLLECTION_DETAIL, { collectionName });

  const history = useHistory();
  const location = useLocation();

  const { t: collectionTrans } = useTranslation('collection');

  const activeTabIndex = useMemo(() => {
    const { activeIndex } = location.search
      ? parseLocationSearch(location.search)
      : { activeIndex: TAB_EMUM.schema };
    return Number(activeIndex);
  }, [location]);

  const handleTabChange = (activeIndex: number) => {
    const path = location.pathname;
    history.push(`${path}?activeIndex=${activeIndex}`);
  };

  const tabs: ITab[] = [
    {
      label: collectionTrans('schemaTab'),
      component: <Schema collectionName={collectionName} />,
    },
    {
      label: collectionTrans('partitionTab'),
      component: <Partitions collectionName={collectionName} />,
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
