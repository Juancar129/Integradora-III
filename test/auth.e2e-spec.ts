import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userCredentials = {
    name: 'Test User',
    email: 'juan@gmail.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    userCredentials.email = `testuser_${Date.now()}@example.com`;  

   
    await prisma.user.deleteMany({
      where: { email: userCredentials.email },
    });
  });

  afterAll(async () => {

    await prisma.user.deleteMany({
      where: { email: userCredentials.email },
    });
    await app.close();
  });

  it('Registrar usuario debe retornar 201', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(userCredentials)
      .expect(201);
  });

  it('Login con credenciales válidas debe retornar 201 y token', async () => {

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(userCredentials)
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userCredentials.email,
        password: userCredentials.password,
      })
      .expect(201);

    expect(loginResponse.body).toHaveProperty('access_token');
  });

  it('Acceder perfil sin token debe retornar 401', () => {
    return request(app.getHttpServer())
      .get('/profile')
      .expect(401);
  });

  it('Acceder perfil con token válido debe retornar 200 y el email correcto', async () => {

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(userCredentials)
      .expect(201);


    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userCredentials.email,
        password: userCredentials.password,
      })
      .expect(201);

    const jwtToken = loginResponse.body.access_token;

    const profileResponse = await request(app.getHttpServer())
      .get('/profile')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(profileResponse.body.email).toBe(userCredentials.email);
  });
});
