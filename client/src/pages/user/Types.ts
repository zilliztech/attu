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

export interface Privilege {
  roleName: string;
  object: string;
  objectName: string;
  privilegeName: string;
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
