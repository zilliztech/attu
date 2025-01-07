import PrivilegeGroups from '@/pages/user/PrivilegeGroups';

const userTrans = {
  createTitle: '创建用户',
  updateTitle: '更新Milvus用户',
  updateRoleTitle: '更新用户角色',
  user: '用户',
  users: '用户们',
  deleteWarning: '您正在尝试删除用户。此操作无法撤销。',
  oldPassword: '当前密码',
  newPassword: '新密码',
  confirmPassword: '确认密码',
  update: '更新密码',
  isNotSame: '与新密码不同',
  deleteTip: '请至少选择一个要删除的项目，不能删除root用户。',

  // role
  deleteEditRoleTip: 'root角色不可编辑。',
  disableEditRolePrivilegeTip: 'admin和public角色不可编辑。',

  role: '角色',
  editRole: '编辑角色',
  roles: '角色',
  createRoleTitle: '创建角色',
  updateRolePrivilegeTitle: '更新角色',
  updateRoleSuccess: '用户角色',
  type: '类型',

  // Privileges
  privileges: '权限',
  objectCollection: '集合',
  objectGlobal: '全局',
  objectUser: '用户',

  forceDelLabel: '强制删除，撤销所有权限。',

  // Privilege Groups
  privilegeGroups: '权限组',
  privilegeGroup: '权限组',
  name: '名称',
  editPrivilegeGroup: '编辑权限组',
  deletePrivilegGroupWarning: '您正在尝试删除权限组，请确保没有角色与其绑定。',
  createPrivilegeGroupTitle: '创建权限组',
  updatePrivilegeGroupTitle: '更新权限组',
};

export default userTrans;
