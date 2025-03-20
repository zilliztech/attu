import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import RouteTabList from '@/components/customTabList/RouteTabList';
import Partitions from './collections/partitions/Partitions';
import Schema from './collections/schema/Schema';
import Data from './collections/data/CollectionData';
import Segments from './collections/segments/Segments';
import Properties from './collections/properties/Properties';
import Search from './collections/search/Search';
import { authContext } from '@/context';
import type { SearchParams, QueryState } from './types';
import type { CollectionObject, CollectionFullObject } from '@server/types';
import type { ITab } from '@/components/customTabList/Types';

// Collection tab pages
export const CollectionsTabs = (props: {
  collectionPage: string; // current collection page
  collectionName: string; // current collection name
  tabClass: string; // tab class
  collections: CollectionObject[]; // collections
  searchParams: SearchParams; // search params
  setSearchParams: (params: SearchParams) => void; // set search params
  queryState: QueryState; // query state
  setQueryState: (state: QueryState) => void; // set query state
}) => {
  // props
  const {
    collectionPage,
    collectionName,
    tabClass,
    collections,
    searchParams,
    setSearchParams,
    queryState,
    setQueryState,
  } = props;

  // context
  const { isManaged } = useContext(authContext);
  // i18n
  const { t: collectionTrans } = useTranslation('collection');

  const collection = collections.find(
    i => i.collection_name === collectionName
  ) as CollectionFullObject;

  // collection tabs
  const collectionTabs: ITab[] = [
    {
      label: collectionTrans('schemaTab'),
      component: <Schema />,
      path: `schema`,
    },
    {
      label: collectionTrans('searchTab'),
      component: (
        <Search
          collections={collections}
          collectionName={collectionName}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      ),
      path: `search`,
    },
    {
      label: collectionTrans('dataTab'),
      component: <Data queryState={queryState} setQueryState={setQueryState} />,
      path: `data`,
    },
    {
      label: collectionTrans('partitionTab'),
      component: <Partitions />,
      path: `partitions`,
    },
  ];

  if (!isManaged) {
    collectionTabs.push(
      {
        label: collectionTrans('segmentsTab'),
        component: <Segments />,
        path: `segments`,
      },
      {
        label: collectionTrans('propertiesTab'),
        component: <Properties type="collection" target={collection} />,
        path: `properties`,
      }
    );
  }

  // get active collection tab
  const activeColTab = collectionTabs.findIndex(t => t.path === collectionPage);

  return (
    <RouteTabList
      tabs={collectionTabs}
      wrapperClass={tabClass}
      activeIndex={activeColTab !== -1 ? activeColTab : 0}
    />
  );
};
