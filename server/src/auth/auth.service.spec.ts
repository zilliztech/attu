import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './const';
import { JwtStrategy } from './jwt.strategy';
import { HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let localStrategy: LocalStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '1d' },
        }),
        UsersModule,
      ],
      providers: [AuthService, LocalStrategy, JwtStrategy],
    }).compile();

    service = module.get<AuthService>(AuthService);
    localStrategy = module.get<LocalStrategy>(LocalStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('validateUser shoule be true', async () => {
    const res = await service.validateUser('milvus', 'milvus-em');
    expect(res).toEqual({ userId: 1, username: 'milvus' });
  });

  it('validateUser shoule be null', async () => {
    const res = await service.validateUser('notexist', '123');
    expect(res).toBeNull();
  });

  it('login', async () => {
    const res = await service.login({ username: 'milvus', userId: 1 });
    expect(res).toHaveProperty('access_token');
  });

  it('local validate', async function() {
    try {
      await localStrategy.validate('notexist', 'asd');
    } catch (e) {
      expect(e.status).toEqual(HttpStatus.UNAUTHORIZED);
    }
  });
});
