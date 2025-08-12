// src/projects/projects.controller.ts
import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project } from '@prisma/client';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() dto: { name: string; description: string }): Promise<Project> {
    return this.projectsService.create(dto);
  }

  @Get()
  findAll(): Promise<Project[]> {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Project> {
    return this.projectsService.findOne(id);
  }
}
