import {
  SelectRoleResponse,
  ListCredUsersResponse,
  ListPrivilegeGroupsResponse
} from '@zilliz/milvus2-sdk-node';

export type Users = ListCredUsersResponse;
export type UsersWithRoles = SelectRoleResponse;
export type PrivilegeGroups = ListPrivilegeGroupsResponse;