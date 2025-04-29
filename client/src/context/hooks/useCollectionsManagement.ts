import { useCallback, useRef, useState, useEffect } from 'react';
import { CollectionService, MilvusService } from '@/http';
import { WS_EVENTS, WS_EVENTS_TYPE, LOADING_STATE } from '@server/utils/Const';
import { checkIndexing, checkLoading } from '@server/utils/Shared';
import type { CollectionObject, CollectionFullObject } from '@server/types';

export function useCollectionsManagement(database: string) {
  const [collections, setCollections] = useState<CollectionObject[]>([]);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const databaseRef = useRef(database);

  // Update the ref when database changes
  useEffect(() => {
    databaseRef.current = database;
  }, [database]);

  const detectLoadingIndexing = useCallback(
    (collections: CollectionObject[]) => {
      const LoadingOrBuildingCollections = collections.filter(v => {
        const isLoading = checkLoading(v);
        const isBuildingIndex = checkIndexing(v);
        return isLoading || isBuildingIndex;
      });
      if (LoadingOrBuildingCollections.length > 0) {
        MilvusService.triggerCron({
          name: WS_EVENTS.COLLECTION_UPDATE,
          type: WS_EVENTS_TYPE.START,
          payload: {
            database: databaseRef.current,
            collections: LoadingOrBuildingCollections.map(
              c => c.collection_name
            ),
          },
        });
      }
    },
    [] // Removing database from dependencies
  );

  const updateCollections = useCallback(
    (props: { collections: CollectionFullObject[]; database?: string }) => {
      const { collections: updated = [], database: remote } = props;
      if (
        remote !== databaseRef.current &&
        databaseRef.current !== undefined &&
        remote !== undefined
      ) {
        return;
      }
      detectLoadingIndexing(updated);
      setCollections(prev => {
        const prevMap = new Map(prev.map(c => [c.id, c]));
        updated.forEach(c => {
          prevMap.set(c.id, c);
        });
        const merged = Array.from(prevMap.values());
        const newCollections = updated.filter(
          c => !prev.some(p => p.collection_name === c.collection_name)
        );
        if (newCollections.length > 0) {
          return merged.sort((a, b) => {
            if (
              a.loadedPercentage === b.loadedPercentage &&
              a.schema &&
              b.schema
            ) {
              if (a.schema.hasVectorIndex === b.schema.hasVectorIndex) {
                return b.createdTime - a.createdTime;
              }
              return a.schema.hasVectorIndex ? -1 : 1;
            }
            return (b.loadedPercentage || 0) - (a.loadedPercentage || 0);
          });
        }
        return merged;
      });
    },
    [detectLoadingIndexing] // Removed database dependency
  );

  const refreshCollectionsDebounceMapRef = useRef<
    Map<
      string,
      { timer: NodeJS.Timeout | null; names: string[]; pending: Set<string> }
    >
  >(new Map());

  const fetchCollections = async () => {
    const currentRequestId = ++requestIdRef.current;
    try {
      setLoading(true);

      setCollections([]);
      const res = await CollectionService.getAllCollections();
      if (currentRequestId === requestIdRef.current) {
        detectLoadingIndexing(res);
        setCollections(res);
        setLoading(false);
      }
    } catch (error) {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
      throw error;
    }
  };

  const fetchCollection = async (name: string) => {
    const res = await CollectionService.getCollection(name);
    updateCollections({ collections: [res] });
    return res;
  };

  const batchRefreshCollections = useCallback(
    (collectionNames: string[], key: string = 'default') => {
      let ref = refreshCollectionsDebounceMapRef.current.get(key);
      if (!ref) {
        ref = { timer: null, names: [], pending: new Set() };
        refreshCollectionsDebounceMapRef.current.set(key, ref);
      }
      const filteredCollectionNames = collectionNames.filter(name => {
        const collection = collections.find(v => v.collection_name === name);
        return collection && !collection.schema && !ref!.pending.has(name);
      });
      ref.names = filteredCollectionNames;
      if (ref.timer) {
        clearTimeout(ref.timer);
      }
      function getRandomBatchSize() {
        const weights = [2, 2, 2, 3, 3, 3, 4, 4, 5];
        return weights[Math.floor(Math.random() * weights.length)];
      }
      ref.timer = setTimeout(async () => {
        if (ref!.names.length === 0) return;
        try {
          while (ref!.names.length > 0) {
            const batchSize = getRandomBatchSize();
            let batch = ref!.names.slice(0, batchSize);
            batch = batch.filter(name => {
              const collection = collections.find(
                v => v.collection_name === name
              );
              return collection && !collection.schema;
            });
            batch.forEach(name => ref!.pending.add(name));
            // call api
            const res = await CollectionService.getCollections({
              db_name: databaseRef.current,
              collections: batch,
            });
            updateCollections({
              collections: res.filter(c => c.db_name === databaseRef.current),
            });
            batch.forEach(name => ref!.pending.delete(name));
            ref!.names = ref!.names.slice(batch.length);
          }
        } catch (error) {
          console.error('Failed to refresh collections:', error);
        }
        ref!.names = [];
        ref!.timer = null;
      }, 200);
    },
    [collections, updateCollections] // Removed database dependency
  );

  const loadCollection = async (name: string, param?: any) => {
    const res = await CollectionService.loadCollection(name, param);
    const collection = collections.find(
      v => v.collection_name === name
    ) as CollectionFullObject;
    if (collection) {
      collection.loadedPercentage = 0;
      collection.loaded = false;
      collection.status = LOADING_STATE.LOADING;
    }
    updateCollections({ collections: [collection] });
    return res;
  };

  const dropCollection = async (name: string) => {
    const dropped = await CollectionService.dropCollection(name);
    if (dropped.error_code === 'Success') {
      setCollections(prev => prev.filter(v => v.collection_name !== name));
    }
    return dropped;
  };

  return {
    collections,
    setCollections,
    loading,
    fetchCollections,
    fetchCollection,
    batchRefreshCollections,
    loadCollection,
    dropCollection,
    updateCollections,
  };
}
