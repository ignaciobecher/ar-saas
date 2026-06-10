import { Injectable } from '@nestjs/common';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';
import { WorkspacesRepository } from './workspaces.repository';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly workspacesRepository: WorkspacesRepository,
  ) {}

  async create(ownerId: string, name: string): Promise<WorkspaceDocument> {
    const slug = await this.generateUniqueSlug(name);
    return this.workspacesRepository.create({ name, slug, ownerId });
  }

  async update(
    id: string,
    data: Partial<Workspace>,
  ): Promise<WorkspaceDocument | null> {
    return this.workspacesRepository.update(id, data);
  }

  async findById(id: string): Promise<WorkspaceDocument | null> {
    return this.workspacesRepository.findById(id);
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = base || 'workspace';
    let counter = 1;
    while (await this.workspacesRepository.findBySlug(slug)) {
      slug = `${base}-${counter++}`;
    }
    return slug;
  }
}
