import { LoadReplicaReq } from '@/pages/collections/Types';
import { QueryParam } from '@/pages/query/Types';
import BaseModel from './BaseModel';
import {
  ShowCollectionsType,
  CollectionFullObject,
  CollectionObject,
  CountObject,
  StatisticsObject,
} from '@server/types';

export class CollectionService extends BaseModel {
  static getCollections(data?: {
    type: ShowCollectionsType;
  }): Promise<CollectionObject[]> {
    return super.findAll({ path: '/collections', params: data || {} });
  }

  static getCollectionInfo(collectionName: string) {
    return super.search<CollectionFullObject>({
      path: `/collections/${collectionName}`,
      params: {},
    });
  }

  static createCollection(data: any) {
    return super.create({ path: `collections`, data });
  }

  static deleteCollection(collectionName: string) {
    return super.delete({ path: `/collections/${collectionName}` });
  }

  static loadCollection(collectionName: string, param?: LoadReplicaReq) {
    return super.update({
      path: `/collections/${collectionName}/load`,
      data: param,
    });
  }

  static releaseCollection(collectionName: string) {
    return super.update({
      path: `/collections/${collectionName}/release`,
    });
  }

  static renameCollection(
    collectionName: string,
    params: { new_collection_name: string }
  ) {
    return super.create({
      path: `/collections/${collectionName}`,
      data: params,
    });
  }

  static duplicate(
    collectionName: string,
    params: { new_collection_name: string }
  ) {
    return super.create({
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
    return super.create({
      path: `/collections/${collectionName}/alias`,
      data: params,
    });
  }

  static dropAlias(collectionName: string, params: { alias: string }) {
    return super.delete({
      path: `/collections/${collectionName}/alias/${params.alias}`,
    });
  }

  static queryData(collectionName: string, params: QueryParam) {
    return super.query({
      path: `/collections/${collectionName}/query`,
      data: params,
    });
  }
}
