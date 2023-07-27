import { NextFunction, Request, Response, Router } from 'express';
import { dtoValidationMiddleware } from '../middlewares/validation';
import { UserService } from './users.service';
import { milvusService } from '../milvus';

import { CreateUserDto, UpdateUserDto, CreateRoleDto } from './dto';

export class UserController {
  private router: Router;
  private userService: UserService;

  constructor() {
    this.userService = new UserService(milvusService);
    this.router = Router();
  }

  generateRoutes() {
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

    this.router.get('/roles', this.getRoles.bind(this));

    this.router.post(
      '/roles',
      dtoValidationMiddleware(CreateRoleDto),
      this.createRole.bind(this)
    );

    this.router.delete('/roles/:roleName', this.deleteRole.bind(this));

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
      const result = await this.userService.getRoles();
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
    try {
      const result = await this.userService.deleteRole({ roleName });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
