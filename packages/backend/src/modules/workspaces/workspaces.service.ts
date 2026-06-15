import { Injectable, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
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
    name: string,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.workspacesRepository.update(id, { name });
    if (!workspace) throw new NotFoundException('Workspace no encontrado');
    return workspace;
  }

  async updatePartial(
    id: string,
    data: Partial<Workspace>,
  ): Promise<WorkspaceDocument | null> {
    return this.workspacesRepository.update(id, data);
  }

  async delete(id: string): Promise<WorkspaceDocument | null> {
    return this.workspacesRepository.delete(id);
  }

  async findById(id: string): Promise<WorkspaceDocument> {
    const workspace = await this.workspacesRepository.findById(id);
    if (!workspace) throw new NotFoundException('Workspace no encontrado');
    return workspace;
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
    const MAX_ATTEMPTS = 20;
    while (counter <= MAX_ATTEMPTS && (await this.workspacesRepository.findBySlug(slug))) {
      slug = `${base}-${counter++}`;
    }
    if (counter > MAX_ATTEMPTS) {
      slug = `${base}-${crypto.randomBytes(4).toString('hex')}`;
    }
    return slug;
  }
}
