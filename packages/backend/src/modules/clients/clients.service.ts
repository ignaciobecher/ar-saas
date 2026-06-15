import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  findAll(workspaceId: string, query: QueryClientDto) {
    const { page, limit, search, status } = query;
    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    return this.clientsRepository.paginate(workspaceId, { page, limit, filter, sort: { createdAt: -1 } });
  }

  async findOne(workspaceId: string, id: string) {
    const client = await this.clientsRepository.findById(workspaceId, id);
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  create(workspaceId: string, userId: string, dto: CreateClientDto) {
    return this.clientsRepository.create({
      ...dto,
      workspaceId: workspaceId as unknown as import('mongoose').Types.ObjectId,
      createdBy: userId as unknown as import('mongoose').Types.ObjectId,
      deletedAt: null,
    } as never);
  }

  async update(workspaceId: string, id: string, dto: UpdateClientDto) {
    await this.findOne(workspaceId, id);
    const client = await this.clientsRepository.update(workspaceId, id, dto);
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async remove(workspaceId: string, id: string) {
    await this.findOne(workspaceId, id);
    await this.clientsRepository.softDelete(workspaceId, id);
  }
}
