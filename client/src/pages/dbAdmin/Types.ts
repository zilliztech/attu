export interface DatabaseData {
  name: string;
}
export interface CreateDatabaseParams {
  db_name: string;
}

export interface CreateDatabaseProps {
  handleCreate: (data: CreateDatabaseParams) => void;
  handleClose: () => void;
}

export interface DropDatabaseParams {
  db_name: string;
}
