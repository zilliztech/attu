import { create } from "domain";

const userTrans = {
  createTitle: 'Create User',
  updateTitle: 'Update Milvus User',
  updateRoleTitle: 'Update User Roles',
  user: 'User',
  users: 'Users',
  deleteWarning: 'You are trying to drop user. This action cannot be undone.',
  oldPassword: 'Current Password',
  newPassword: 'New Password',
  confirmPassword: 'Confirm Password',
  update: 'Update Password',
  isNotSame: 'Not same as new password',
  deleteTip:
    'Please select at least one item to drop and the root user can not be dropped.',

  // role
  deleteEditRoleTip: 'root role is not editable.',
  disableEditRolePrivilegeTip: 'admin and public role are not editable.',

  role: 'Role',
  editRole: 'Edit Role',
  roles: 'Roles',
  createRoleTitle: 'Create Role',
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
};

export default userTrans;
