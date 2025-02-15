const userTrans = {
  createTitle: 'Create User',
  updateTitle: 'Update Milvus User',
  updateRoleTitle: 'Update User Roles',
  user: 'User',
  users: 'Users',
  deleteWarning: 'You are trying to drop user. This action cannot be undone.',
  deleteRoleWarning:
    'You are trying to drop role. This action cannot be undone.',
  oldPassword: 'Current Password',
  newPassword: 'New Password',
  confirmPassword: 'Confirm Password',
  update: 'Update Password',
  isNotSame: 'Not same as new password',
  deleteTip:
    'Please select at least one item to drop and the root user can not be dropped.',
  deleteRoleTip:
    'Please select at least one item to drop and the admin/public role can not be dropped.',
  editPassword: 'Edit Password',
  editPassDisabledTip: 'Please select one user to edit.',

  // role
  deleteEditRoleTip: 'Please select one user to edit, root is not editable.',
  disableEditRolePrivilegeTip: 'admin and public role are not editable.',

  role: 'Role',
  editRole: 'Edit Role',
  roles: 'Roles',
  createRoleTitle: 'Create Role',
  dupicateRoleTitle: 'Duplicate Role',
  updateRolePrivilegeTitle: 'Update Role',
  updateRoleSuccess: 'User Role',
  type: 'Type',

  // Privileges
  privileges: 'Privileges',
  objectCollection: 'Collection',
  objectGlobal: 'Global',
  objectUser: 'User',

  forceDelLabel: 'Force delete, revoke all privileges.',

  // Privilege Groups
  privilegeGroups: 'Privilege Groups',
  privilegeGroup: 'Privilege Group',
  name: 'Name',
  editPrivilegeGroup: 'Edit Privilege Group',
  deletePrivilegGroupWarning:
    'You are trying to drop the privilege group, please make sure no role is bound to it.',
  createPrivilegeGroupTitle: 'Create Privilege Group',
  updatePrivilegeGroupTitle: 'Update Privilege Group',
  allCollections: 'All Collections',
  allDatabases: 'All Databases',

  collections: 'Collections',
  collection: 'Collection',
  databases: 'Databases',
  database: 'Database',
  cluster: 'Cluster',

  DatabasePrivileges: 'Database Privileges',
  CollectionPrivileges: 'Collection Privileges',
  PartitionPrivileges: 'Partition Privileges',
  IndexPrivileges: 'Index Privileges',
  EntityPrivileges: 'Entity Privileges',
  ResourceManagementPrivileges: 'Resource Management Privileges',
  RBACPrivileges: 'RBAC Privileges',

  CollectionPrivilegeGroups: 'Built-in Groups',
  DatabasePrivilegeGroups: 'Built-in Groups',
  ClusterPrivilegeGroups: 'Built-in Groups',
  CustomPrivilegeGroups: 'User-defined Groups',
};

export default userTrans;
