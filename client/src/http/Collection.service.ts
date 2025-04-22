import { LoadReplicaReq } from '@/pages/databases/collections/Types';
import { QueryParam } from '@/pages/databases/collections/data/Types';
import BaseModel from './BaseModel';
import {
  ShowCollectionsType,
  CollectionFullObject,
  CollectionObject,
  CountObject,
  StatisticsObject,
  ResStatus,
  MmapChanges,
  QueryResults,
} from '@server/types';
import { ManageRequestMethods } from '@/consts';
import type {
  IndexCreateParam,
  IndexManageParam,
} from '@/pages/databases/collections/schema/Types';

export class CollectionService extends BaseModel {
  static getCollections(data?: {
    type: ShowCollectionsType;
  }): Promise<CollectionObject[]> {
    return super.find({ path: `/collections`, params: data || {} });
  }

  static getCollectionsNames(data?: { db_name: string }): Promise<string[]> {
    return super.find({ path: `/collections/names`, params: data || {} });
  }

  static describeCollectionUnformatted(collectionName: string) {
    return super.search({
      path: `/collections/${collectionName}/unformatted`,
      params: {},
    });
  }

  static getCollection(collectionName: string) {
    return super.search<CollectionFullObject>({
      path: `/collections/${collectionName}`,
      params: {},
    });
  }

  static createCollection(data: any) {
    return super.create<CollectionFullObject>({ path: `collections`, data });
  }

  static dropCollection(collectionName: string) {
    return super.delete<{ data: ResStatus }>({
      path: `/collections/${collectionName}`,
    });
  }

  static loadCollection(collectionName: string, param?: LoadReplicaReq) {
    return super.update<ResStatus>({
      path: `/collections/${collectionName}/load`,
      data: param,
    });
  }

  static releaseCollection(collectionName: string) {
    return super.update<ResStatus>({
      path: `/collections/${collectionName}/release`,
    });
  }

  static renameCollection(
    collectionName: string,
    params: { new_collection_name: string }
  ) {
    return super.create<CollectionFullObject>({
      path: `/collections/${collectionName}`,
      data: params,
    });
  }

  static setProperty(collectionName: string, params: { [key: string]: any }) {
    return super.update<CollectionFullObject>({
      path: `/collections/${collectionName}/properties`,
      data: { properties: params },
    });
  }

  static duplicateCollection(
    collectionName: string,
    params: { new_collection_name: string }
  ) {
    return super.create<CollectionFullObject>({
      path: `/collections/${collectionName}/duplicate`,
      data: params,
    });
  }

  static getStatistics() {
    return super.search<StatisticsObject>({
      path: `/collections/statistics`,
      params: {},
    });
  }

  static count(collectionName: string) {
    return super.search<CountObject>({
      path: `/collections/${collectionName}/count`,
      params: {},
    });
  }

  static createAlias(collectionName: string, params: { alias: string }) {
    return super.create<CollectionFullObject>({
      path: `/collections/${collectionName}/alias`,
      data: params,
    });
  }

  static dropAlias(collectionName: string, params: { alias: string }) {
    return super.delete<{ data: CollectionFullObject }>({
      path: `/collections/${collectionName}/alias/${params.alias}`,
    });
  }

  static async createIndex(param: IndexCreateParam) {
    const path = `/collections/index`;
    const type: ManageRequestMethods = ManageRequestMethods.CREATE;

    return super.create<CollectionFullObject>({
      path,
      data: { ...param, type },
    });
  }

  static async dropIndex(param: IndexManageParam) {
    const path = `/collections/index`;
    const type: ManageRequestMethods = ManageRequestMethods.DELETE;

    return super.batchDelete<{ data: CollectionFullObject }>({
      path,
      data: { ...param, type },
    });
  }

  static queryData(collectionName: string, params: QueryParam) {
    return super.query<QueryResults>({
      path: `/collections/${collectionName}/query`,
      data: params,
    });
  }

  static async updateMmap(
    collectionName: string,
    params: MmapChanges[]
  ): Promise<ResStatus> {
    const path = `/collections/${collectionName}/mmap`;

    return super.update<ResStatus>({
      path,
      data: params,
    });
  }
}
