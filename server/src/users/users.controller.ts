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
import type {
  DBCollectionsPrivileges,
  RolesWithPrivileges,
} from '../types/users.type';

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
    this.router.get(
      '/privilegeGroups',
      this.getDefaultPriviegGroups.bind(this)
    );
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

      const results = [];
      for (let i = 0; i < result.usernames.length; i++) {
        const username = result.usernames[i];
        const roles = await this.userService.selectUser(req.clientId, {
          username,
          includeRoleInfo: true,
        });
        results.push({
          username,
          roles: roles.results[0].roles.map(r => r.name),
        });
        if (username === 'root') {
          // Remove the recently pushed "root" user and insert it at the beginning of the results array
          const rootUser = results.pop();
          results.unshift(rootUser);
        }
      }

      res.send(results);
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
      // Fetch all roles
      const rolesResult = await this.userService.getRoles(req.clientId);

      // Initialize the result array
      const rolesWithPrivileges: RolesWithPrivileges[] = [];

      // Iterate through each role
      for (let i = 0; i < rolesResult.results.length; i++) {
        const roleName = rolesResult.results[i].role.name;

        // Fetch grants for the current role
        const grantsResponse = await this.userService.listGrants(
          req.clientId,
          roleName
        );

        // Initialize the privileges structure for the current role
        const dbCollectionsPrivileges: DBCollectionsPrivileges = {};

        // Iterate through each grant entity
        for (const entity of grantsResponse.entities) {
          const { db_name, object_name, grantor } = entity;

          // Initialize the database entry if it doesn't exist
          if (!dbCollectionsPrivileges[db_name]) {
            dbCollectionsPrivileges[db_name] = {
              collections: {},
            };
          }

          // Initialize the collection entry if it doesn't exist
          if (!dbCollectionsPrivileges[db_name].collections[object_name]) {
            dbCollectionsPrivileges[db_name].collections[object_name] = {};
          }

          // Add the privilege to the collection
          dbCollectionsPrivileges[db_name].collections[object_name][
            grantor.privilege.name
          ] = true;
        }

        // Add the role and its privileges to the result array
        rolesWithPrivileges.push({
          roleName,
          privileges: dbCollectionsPrivileges,
        });
      }

      // Send the transformed result
      res.status(200).json(rolesWithPrivileges);
    } catch (error) {
      // Pass the error to the error-handling middleware
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
      const result = await this.userService.getRBAC(req.clientId);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async getDefaultPriviegGroups(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await this.userService.getPriviegGroups(req.clientId);
      res.send(result.default);
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
        db_name: '*',
      } as any);
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  async updateRolePrivileges(
    req: Request<
      { roleName: string },
      {},
      { privileges: DBCollectionsPrivileges }
    >,
    res: Response,
    next: NextFunction
  ) {
    const { privileges } = req.body;
    const { roleName } = req.params;
    const clientId = req.clientId;

    const results = [];
    const rollbackStack = []; // Stack to store actions for rollback in case of failure

    try {
      // check if role exists
      const hasRole = await this.userService.hasRole(clientId, {
        roleName,
      });
      // if role does not exist, create it
      if (hasRole.hasRole === false) {
        await this.userService.createRole(clientId, { roleName });
      }

      // Iterate over each database
      for (const [dbName, dbPrivileges] of Object.entries(privileges)) {
        // Iterate over each collection in the database
        for (const [collectionName, collectionPrivileges] of Object.entries(
          dbPrivileges.collections
        )) {
          // Iterate over each privilege in the collection
          for (const [privilegeName, isGranted] of Object.entries(
            collectionPrivileges
          )) {
            const requestData = {
              role: roleName,
              privilege: privilegeName,
              db_name: dbName,
              collection_name: collectionName,
            };

            let result;
            try {
              if (isGranted) {
                // If the privilege is true, call grantPrivilegeV2
                result = await this.userService.grantPrivilegeV2(
                  clientId,
                  requestData
                );
                // Push the reverse action (revoke) to the rollback stack
                rollbackStack.push({ action: 'revoke', data: requestData });
              } else {
                // If the privilege is false, call revokePrivilegeV2
                result = await this.userService.revokePrivilegeV2(
                  clientId,
                  requestData
                );
                // Push the reverse action (grant) to the rollback stack
                rollbackStack.push({ action: 'grant', data: requestData });
              }

              // Collect the result
              results.push({
                dbName,
                collectionName,
                privilegeName,
                isGranted,
                result,
              });
            } catch (error) {
              // If an error occurs, log it and initiate rollback
              console.error(
                `Failed to update privilege: ${privilegeName} for collection: ${collectionName} in database: ${dbName}`,
                error
              );

              // Rollback all previously applied changes
              while (rollbackStack.length > 0) {
                const { action, data } = rollbackStack.pop();
                try {
                  if (action === 'grant') {
                    await this.userService.grantPrivilegeV2(clientId, data);
                  } else if (action === 'revoke') {
                    await this.userService.revokePrivilegeV2(clientId, data);
                  }
                } catch (rollbackError) {
                  console.error(
                    `Rollback failed for action: ${action} on privilege: ${data.privilege}`,
                    rollbackError
                  );
                }
              }

              // drop the role if creation fails
              await this.userService.deleteRole(clientId, { roleName });

              // Propagate the error to the error handler
              throw error;
            }
          }
        }
      }

      // Return the results if everything succeeds
      res.status(200).json({ results });
    } catch (error) {
      // Pass the error to the error-handling middleware
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
        privileges,
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
      group_name,
    });

    // if no group found, return error
    if (!theGroup) {
      return next(new Error('Group not found'));
    }

    try {
      // remove all privileges from the group
      await this.userService.removePrivilegeFromGroup(req.clientId, {
        group_name,
        privileges: theGroup.privileges.map(p => p.name),
      });

      // add new privileges to the group
      const result = await this.userService.addPrivilegeToGroup(req.clientId, {
        group_name,
        privileges,
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
        role,
        collection_name: collection || '*',
        db_name: req.db_name,
        privilege,
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
        role,
        collection_name: collection || '*',
        db_name: req.db_name,
        privilege,
      });
      res.send(result);
    } catch (error) {
      next(error);
    }
  }
}
