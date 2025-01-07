import {
  SelectRoleResponse,
  ListCredUsersResponse,
  ListPrivilegeGroupsResponse,
  PrivelegeGroup,
} from '@zilliz/milvus2-sdk-node';

export type Users = ListCredUsersResponse;
export type UsersWithRoles = SelectRoleResponse;
export type PrivilegeGroupsRes = ListPrivilegeGroupsResponse;
export type PrivilegeGroup = PrivelegeGroup;
