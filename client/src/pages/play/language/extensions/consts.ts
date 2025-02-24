import { IdentifierMap } from '../../Types';
import OpenApiJSON from './json/openapi.json';

export const VersionMap = {
  v2: ['vectordb'],
};

export const ObjectMap = {
  vectordb: [
    'aliases',
    'databases',
    'collections',
    'partitions',
    'jobs',
    'indexes',
    'resource_groups',
    'roles',
    'users',
    'entities',
  ],
};

export const IdentifierMapArr = OpenApiJSON as IdentifierMap[];
