import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AuthService } from './auth/auth.service';

const testUser = {
  userId: 1,
  username: 'milvus',
  password: 'milvus-admin',
}
class AuthServiceMock {
  login = () => testUser;
}

const AuthServiceProvider = {
  provide: AuthService,
  useClass: AuthServiceMock,
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AuthServiceProvider],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should defined', () => {
      expect(appController).toBeDefined();
    });

    it('should return result', async () => {
      const data = await appController.login(1);
      expect(data).toBe(testUser);
    });
  });
});
