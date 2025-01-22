import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middleware/validation';
import { UserService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  AssignUserRoleDto,
  UnassignUserRoleDto,
  UpdatePrivilegeGroupDto,
  CreatePrivilegeGroupDto,
  PrivilegeToRoleDto,
} from './dto';
import { OperateRolePrivilegeReq } from '@zilliz/milvus2-sdk-node';

export class UserController {
  private router: Router;
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
    this.router = Router();
  }

  generateRoutes() {
    // user
    this.router.get('/', this.getUsers.bind(this));
    this.router.post(
      '/',
      dtoValidationMiddleware(CreateUserDto),
      this.createUsers.bind(this)
    );
    this.router.put(
      '/',
      dtoValidationMiddleware(UpdateUserDto),
      this.updateUsers.bind(this)
    );
    this.router.delete('/:username', this.deleteUser.bind(this));
    this.router.put(
      '/:username/role/update',
      dtoValidationMiddleware(AssignUserRoleDto),
      this.updateUserRole.bind(this)
    );
    this.router.put(
      '/:username/role/unassign',
      dtoValidationMiddleware(UnassignUserRoleDto),
      this.unassignUserRole.bind(this)
    );

    // role
    this.router.get('/rbac', this.rbac.bind(this));
    this.router.get('/privilegeGroups', this.allPrivilegeGroups.bind(this));
    this.router.get('/roles', this.getRoles.bind(this));
    this.router.post(
      '/roles',
      dtoValidationMiddleware(CreateRoleDto),
      this.createRole.bind(this)
    );
    this.router.get('/roles/:roleName', this.listGrant.bind(this));
    this.router.delete('/roles/:roleName', this.deleteRole.bind(this));
    this.router.put(
      '/roles/:roleName/updatePrivileges',
      this.updateRolePrivileges.bind(this)
    );

    // privilege group
    this.router.get('/privilege-groups', this.getPrivilegeGrps.bind(this));
    this.router.get(
      '/privilege-groups/:group_name',
      this.getPrivilegeGrp.bind(this)
    );
    this.router.post(
      '/privilege-groups',
      dtoValidationMiddleware(CreatePrivilegeGroupDto),
      this.createPrivilegeGrp.bind(this)
    );
    this.router.put(
      '/privilege-groups/:group_name',
      dtoValidationMiddleware(UpdatePrivilegeGroupDto),
      this.updatePrivilegeGrp.bind(this)
    );
    this.router.delete(
      '/privilege-groups/:group_name',
      this.deletePrivilegeGrp.bind(this)
    );

    return this.router;
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.getUsers(req.clientId);

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async createUsers(
    req: Request<{}, {}, CreateUserDto>,
    res: Response,
    next: NextFunction
  ) {
    const { username, password } = req.body;
    try {
      const result = await this.userService.createUser(req.clientId, {
        username,
        password,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUsers(
    req: Request<{}, {}, UpdateUserDto>,
    res: Response,
    next: NextFunction
  ) {
    const { username, oldPassword, newPassword } = req.body;
    try {
      const result = await this.userService.updateUser(req.clientId, {
        username,
        oldPassword,
        newPassword,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(
    req: Request<{ username: string }>,
    res: Response,
    next: NextFunction
  ) {
    const { username } = req.params;
    try {
      const result = await this.userService.deleteUser(req.clientId, {
        username,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.getRoles(req.clientId);

      for (let i = 0; i < result.results.length; i++) {
        const { entities } = await this.userService.listGrants(req.clientId, {
          roleName: result.results[i].role.name,
        });
        result.results[i].entities = entities;
      }

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async createRole(
    req: Request<{}, {}, CreateRoleDto>,
    res: Response,
    next: NextFunction
  ) {
    const { roleName } = req.body;
    try {
      const result = await this.userService.createRole(req.clientId, {
        roleName,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(
    req: Request<{ roleName: string }, {}, { force?: boolean }>,
    res: Response,
    next: NextFunction
  ) {
    const { roleName } = req.params;
    const { force } = req.body;

    try {
      if (force) {
        await this.userService.revokeAllRolePrivileges(req.clientId, {
          roleName,
        });
      }
      const result = await this.userService.deleteRole(req.clientId, {
        roleName,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(
    req: Request<{ username: string }, {}, AssignUserRoleDto>,
    res: Response,
    next: NextFunction
  ) {
    const { username } = req.params;
    const { roles } = req.body;

    const results = [];

    try {
      // get user existing roles
      const selectUser = await this.userService.selectUser(req.clientId, {
        username,
        includeRoleInfo: false,
      });

      const existingRoles = selectUser.results[0].roles;
      // remove user existing roles
      for (let i = 0; i < existingRoles.length; i++) {
        if (existingRoles[i].name.length > 0) {
          await this.userService.unassignUserRole(req.clientId, {
            username,
            roleName: existingRoles[i].name,
          });
        }
      }

      // assign new user roles
      for (let i = 0; i < roles.length; i++) {
        const result = await this.userService.assignUserRole(req.clientId, {
          username,
          roleName: roles[i],
        });
        results.push(result);
      }

      res.send(results);
    } catch (error) {
      next(error);
    }
  }

  async unassignUserRole(
    req: Request<{ username: string }, {}, UnassignUserRoleDto>,
    res: Response,
    next: NextFunction
  ) {
    const { username } = req.params;
    const { roleName } = req.body;

    try {
      const result = await this.userService.unassignUserRole(req.clientId, {
        username,
        roleName,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async rbac(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.getRBAC();
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async allPrivilegeGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.getAllPrivilegeGroups(req.clientId);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async listGrant(
    req: Request<{ roleName: string }>,
    res: Response,
    next: NextFunction
  ) {
    const { roleName } = req.params;
    try {
      const result = await this.userService.listGrants(req.clientId, {
        roleName,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async updateRolePrivileges(
    req: Request<
      { roleName: string },
      {},
      { privileges: OperateRolePrivilegeReq[] }
    >,
    res: Response,
    next: NextFunction
  ) {
    const { privileges } = req.body;
    const { roleName } = req.params;

    const results = [];

    try {
      // revoke all
      await this.userService.revokeAllRolePrivileges(req.clientId, {
        roleName,
      });

      // assign new user roles
      for (let i = 0; i < privileges.length; i++) {
        const result = await this.userService.grantRolePrivilege(
          req.clientId,
          privileges[i]
        );
        results.push(result);
      }

      res.send(results);
    } catch (error) {
      next(error);
    }
  }

  async createPrivilegeGrp(
    req: Request<{}, {}, CreatePrivilegeGroupDto>,
    res: Response,
    next: NextFunction
  ) {
    const { group_name, privileges } = req.body;
    try {
      // create the group
      await this.userService.createPrivilegeGroup(req.clientId, {
        group_name,
      });

      // add privileges to the group
      const result = await this.userService.addPrivilegeToGroup(req.clientId, {
        group_name,
        priviliges: privileges,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async deletePrivilegeGrp(
    req: Request<{ group_name: string }>,
    res: Response,
    next: NextFunction
  ) {
    const { group_name } = req.params;
    try {
      const result = await this.userService.deletePrivilegeGroup(req.clientId, {
        group_name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getPrivilegeGrp(
    req: Request<{ group_name: string }>,
    res: Response,
    next: NextFunction
  ) {
    const { group_name } = req.params;
    try {
      const result = await this.userService.getPrivilegeGroup(req.clientId, {
        group_name,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getPrivilegeGrps(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.getPrivilegeGroups(req.clientId);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async updatePrivilegeGrp(
    req: Request<{ group_name: string }, {}, UpdatePrivilegeGroupDto>,
    res: Response,
    next: NextFunction
  ) {
    // get privilege group
    const { group_name } = req.params;
    const { privileges } = req.body;
    // get existing group
    const theGroup = await this.userService.getPrivilegeGroup(req.clientId, {
      group_name: group_name,
    });

    // if no group found, return error
    if (!theGroup) {
      return next(new Error('Group not found'));
    }

    try {
      // remove all privileges from the group
      await this.userService.removePrivilegeFromGroup(req.clientId, {
        group_name: group_name,
        priviliges: theGroup.privileges.map(p => p.name),
      });

      // add new privileges to the group
      const result = await this.userService.addPrivilegeToGroup(req.clientId, {
        group_name: group_name,
        priviliges: privileges,
      });

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async assignRolePrivilege(
    req: Request<{}, {}, PrivilegeToRoleDto>,
    res: Response,
    next: NextFunction
  ) {
    const { role, collection, privilege } = req.body;
    try {
      const result = await this.userService.grantPrivilegeV2(req.clientId, {
        role: role,
        collection_name: collection || '*',
        db_name: req.db_name,
        privilege: privilege,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async revokeRolePrivilege(
    req: Request<{}, PrivilegeToRoleDto>,
    res: Response,
    next: NextFunction
  ) {
    const { role, collection, privilege } = req.body;
    try {
      const result = await this.userService.revokePrivilegeV2(req.clientId, {
        role: role,
        collection_name: collection || '*',
        db_name: req.db_name,
        privilege: privilege,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
