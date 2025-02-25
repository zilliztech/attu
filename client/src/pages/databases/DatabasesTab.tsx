import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import RouteTabList from '@/components/customTabList/RouteTabList';
import Properties from './collections/properties/Properties';
import { authContext } from '@/context';
import Collections from './collections/Collections';
import type { ITab } from '@/components/customTabList/Types';

// Database tab pages
export const DatabasesTab = (props: {
  databasePage: string; // current database page
  databaseName: string;
  tabClass: string; // tab class
}) => {
  // context
  const { isManaged } = useContext(authContext);
  const { databaseName, tabClass, databasePage } = props;
  const { t: collectionTrans } = useTranslation('collection');

  const dbTab: ITab[] = [
    {
      label: collectionTrans('collections'),
      component: <Collections />,
      path: `collections`,
    },
  ];

  if (!isManaged) {
    dbTab.push({
      label: collectionTrans('properties'),
      component: <Properties type="database" target={databaseName} />,
      path: `properties`,
    });
  }

  const actionDbTab = dbTab.findIndex(t => t.path === databasePage);

  return (
    <RouteTabList
      tabs={dbTab}
      wrapperClass={tabClass}
      activeIndex={actionDbTab !== -1 ? actionDbTab : 0}
    />
  );
};
