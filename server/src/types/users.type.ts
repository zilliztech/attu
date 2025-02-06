import {
  SelectRoleResponse,
  ListCredUsersResponse,
  ListPrivilegeGroupsResponse,
  PrivelegeGroup,
} from '@zilliz/milvus2-sdk-node';

export type Users = ListCredUsersResponse;
export type UsersWithRoles = SelectRoleResponse;
export type UserWithRoles = {
  username: string;
  roles: string[];
};

export type RolesWithPrivileges = {
  roleName: string;
  privileges: DBCollectionsPrivileges;
};

export type PrivilegeGroupsRes = ListPrivilegeGroupsResponse;
export type PrivilegeGroup = PrivelegeGroup;

export type Privilege = {
  [key: string]: boolean; // key: privilege name, value: whether it's selected
};

export type CollectionPrivileges = {
  [collectionValue: string]: Privilege; // key: collection value, value: privileges
};

export type DBPrivileges = {
  collections: CollectionPrivileges; // Collection-level privileges
};

export type DBCollectionsPrivileges = {
  [dbValue: string]: DBPrivileges; // key: DB value, value: DB privileges and collections
};

export type RBACOptions = {
  ClusterPrivilegeGroups: Record<string, unknown>;
  DatabasePrivilegeGroups: Record<string, unknown>;
  CollectionPrivilegeGroups: Record<string, unknown>;
  CustomPrivilegeGroups: Record<string, unknown>;
  CollectionPrivileges: Record<string, unknown>;
  DatabasePrivileges: Record<string, unknown>;
  EntityPrivileges: Record<string, unknown>;
  IndexPrivileges: Record<string, unknown>;
  PartitionPrivileges: Record<string, unknown>;
  RBACPrivileges: Record<string, unknown>;
  ResourceManagementPrivileges: Record<string, unknown>;
};
