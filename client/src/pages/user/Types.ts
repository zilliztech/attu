import { Option as RoleOption } from '@/components/customSelector/Types';

export interface UserData {
  name: string;
  roleName?: string;
  roles: string[];
}

export interface CreateUserParams {
  username: string;
  password: string;
  roles: string[];
}

export interface UpdateUserRoleParams {
  username: string;
  roles: string[];
}

export interface UpdateUserRoleProps {
  onUpdate: (data: UpdateUserRoleParams) => void;
  handleClose: () => void;
  username: string;
  roles: string[];
}

export interface CreateUserProps {
  handleCreate: (data: CreateUserParams) => void;
  handleClose: () => void;
  roleOptions: RoleOption[];
}

export interface UpdateUserProps {
  handleUpdate: (data: UpdateUserParams) => void;
  handleClose: () => void;
  username: string;
}

export interface UpdateUserParams {
  oldPassword: string;
  newPassword: string;
  username: string;
}

export interface DeleteUserParams {
  username: string;
}

export interface CreateRoleParams {
  roleName: string;
  privileges: Privilege[];
}

export interface CreatePrivilegeGroupParams {
  group_name: string;
  privileges: string[];
}

export interface RoleData {
  name: string;
  privileges: Privilege[];
}

export interface CreateRoleProps {
  onUpdate: (data: { data: CreateRoleParams; isEditing: boolean }) => void;
  handleClose: () => void;
  role?: RoleData;
}

export interface DeleteRoleParams {
  roleName: string;
  force?: boolean;
}

export interface AssignRoleParams {
  username: string;
  roles: string[];
}

export interface UnassignRoleParams extends AssignRoleParams {}

export type RBACOptions = {
  [key: string]: Record<string, unknown>;
};

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

export type CollectionOption = {
  name: string;
  value: string;
};

export type DBOption = {
  name: string;
  value: string;
};

export interface DBCollectionsSelectorProps {
  selected: DBCollectionsPrivileges; // Current selected DBs and their collections with privileges
  setSelected: (
    value:
      | DBCollectionsPrivileges
      | ((prev: DBCollectionsPrivileges) => DBCollectionsPrivileges)
  ) => void;
  // Callback to update selected state
  options: {
    rbacOptions: RBACOptions; // Available RBAC options (privileges)
    dbOptions: DBOption[]; // Available databases
  };
}
