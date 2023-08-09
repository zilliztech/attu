import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middlewares/validation';
import { UserService } from './users.service';
import { milvusService } from '../milvus';
import {
  CreateUserDto,
  UpdateUserDto,
  CreateRoleDto,
  AssignUserRoleDto,
  UnassignUserRoleDto,
} from './dto';

export class UserController {
  private router: Router;
  private userService: UserService;

  constructor() {
    this.userService = new UserService(milvusService);
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

    return this.router;
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.userService.getUsers();

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async createUsers(req: Request, res: Response, next: NextFunction) {
    const { username, password } = req.body;
    try {
      const result = await this.userService.createUser({ username, password });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUsers(req: Request, res: Response, next: NextFunction) {
    const { username, oldPassword, newPassword } = req.body;
    try {
      const result = await this.userService.updateUser({
        username,
        oldPassword,
        newPassword,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { username } = req.params;
    try {
      const result = await this.userService.deleteUser({ username });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = (await this.userService.getRoles()) as any;

      for (let i = 0; i < result.results.length; i++) {
        const { entities } = await this.userService.listGrants({
          roleName: result.results[i].role.name,
        });
        result.results[i].entities = entities;
      }

      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async createRole(req: Request, res: Response, next: NextFunction) {
    const { roleName } = req.body;
    try {
      const result = await this.userService.createRole({ roleName });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req: Request, res: Response, next: NextFunction) {
    const { roleName } = req.params;
    const { force } = req.body;

    try {
      if (force) {
        await this.userService.revokeAllRolePrivileges({ roleName });
      }
      const result = await this.userService.deleteRole({ roleName });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction) {
    const { roles } = req.body;
    const { username } = req.params;

    const results = [];

    try {
      // get user existing roles
      const selectUser = await this.userService.selectUser({
        username,
        includeRoleInfo: false,
      });

      const existingRoles = selectUser.results[0].roles;
      // remove user existing roles
      for (let i = 0; i < existingRoles.length; i++) {
        if (existingRoles[i].name.length > 0) {
          await this.userService.unassignUserRole({
            username,
            roleName: existingRoles[i].name,
          });
        }
      }

      // assign new user roles
      for (let i = 0; i < roles.length; i++) {
        const result = await this.userService.assignUserRole({
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

  async unassignUserRole(req: Request, res: Response, next: NextFunction) {
    const { roleName } = req.body;
    const { username } = req.params;

    try {
      const result = await this.userService.unassignUserRole({
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

  async listGrant(req: Request, res: Response, next: NextFunction) {
    const { roleName } = req.params;
    try {
      const result = await this.userService.listGrants({
        roleName,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async updateRolePrivileges(req: Request, res: Response, next: NextFunction) {
    const { privileges } = req.body;
    const { roleName } = req.params;

    const results = [];

    try {
      // revoke all
      this.userService.revokeAllRolePrivileges({ roleName });

      // assign new user roles
      for (let i = 0; i < privileges.length; i++) {
        const result = await this.userService.grantRolePrivilege(privileges[i]);
        results.push(result);
      }

      res.send(results);
    } catch (error) {
      next(error);
    }
  }
}
