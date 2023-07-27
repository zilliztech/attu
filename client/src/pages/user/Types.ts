export interface UserData {
  name: string;
}

export interface CreateUserParams {
  username: string;
  password: string;
}

export interface CreateUserProps {
  handleCreate: (data: CreateUserParams) => void;
  handleClose: () => void;
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
}

export interface CreateRoleProps {
  handleCreate: (data: CreateRoleParams) => void;
  handleClose: () => void;
}

export interface DeleteRoleParams {
  roleName: string;
}

export interface RoleData {
  name: string;
}

export enum TAB_EMUM {
  'schema',
  'partition',
  'data-preview',
  'data-query',
}
