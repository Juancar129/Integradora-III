import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Project } from '@prisma/client';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProject: Project = {
    id: 1,
    name: 'Proyecto Test',
    description: 'Descripción Test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [ProjectsService, PrismaService],
    })
      .overrideProvider(ProjectsService)
      .useValue({
        create: jest.fn().mockResolvedValue(mockProject),
        findAll: jest.fn().mockResolvedValue([mockProject]),
        findOne: jest.fn().mockResolvedValue(mockProject),
      })
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('debería crear un proyecto', async () => {
    const dto = { name: 'Proyecto Test', description: 'Descripción Test' };
    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockProject);
  });

  it('debería devolver todos los proyectos', async () => {
    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockProject]);
  });

  it('debería devolver un proyecto por id', async () => {
    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockProject);
  });

  it('debería lanzar NotFoundException si no existe el proyecto', async () => {
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

    await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
