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

export interface UpdateUserParams {
  username: string;
  oldPassword: string;
  newPassword: string;
}

export interface DeleteUserParams {
  username: string;
}
