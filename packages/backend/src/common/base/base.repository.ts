import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model, Document, Types } from 'mongoose';
import type { QueryFilter, UpdateQuery, PipelineStage } from 'mongoose';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  protected toObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID inválido: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  async findAll(
    workspaceId: string,
    options?: {
      filter?: Record<string, unknown>;
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    },
  ): Promise<T[]> {
    const query = this.buildBaseQuery(workspaceId, options?.filter);
    return this.model
      .find(query)
      .limit(options?.limit ?? 100)
      .skip(options?.skip ?? 0)
      .sort(options?.sort ?? { createdAt: -1 })
      .lean()
      .exec() as unknown as T[];
  }

  async findById(workspaceId: string, id: string): Promise<T | null> {
    return this.model
      .findOne({
        _id: this.toObjectId(id),
        workspaceId: this.toObjectId(workspaceId),
        deletedAt: null,
      })
      .lean()
      .exec() as unknown as T | null;
  }

  async findOne(
    workspaceId: string,
    filter: Record<string, unknown>,
  ): Promise<T | null> {
    return this.model
      .findOne({
        ...filter,
        workspaceId: this.toObjectId(workspaceId),
        deletedAt: null,
      })
      .lean()
      .exec() as unknown as T | null;
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const created = await this.model.create(data);
      return created.toObject() as unknown as T;
    } catch (error: unknown) {
      this.handleMongoError(error);
      throw error;
    }
  }

  async update(
    workspaceId: string,
    id: string,
    data: UpdateQuery<T>,
  ): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(id),
          workspaceId: this.toObjectId(workspaceId),
          deletedAt: null,
        },
        { $set: data },
        { new: true, runValidators: true },
      )
      .lean()
      .exec() as unknown as T | null;
  }

  async softDelete(workspaceId: string, id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(id),
          workspaceId: this.toObjectId(workspaceId),
          deletedAt: null,
        },
        { $set: { deletedAt: new Date() } },
        { new: true },
      )
      .lean()
      .exec() as unknown as T | null;
  }

  async restore(workspaceId: string, id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(id),
          workspaceId: this.toObjectId(workspaceId),
          deletedAt: { $ne: null },
        },
        { $set: { deletedAt: null } },
        { new: true },
      )
      .lean()
      .exec() as unknown as T | null;
  }

  async count(
    workspaceId: string,
    filter?: Record<string, unknown>,
  ): Promise<number> {
    const query = this.buildBaseQuery(workspaceId, filter);
    return this.model.countDocuments(query).exec();
  }

  async exists(
    workspaceId: string,
    filter: Record<string, unknown>,
  ): Promise<boolean> {
    const count = await this.model.countDocuments({
      ...filter,
      workspaceId: this.toObjectId(workspaceId),
      deletedAt: null,
    });
    return count > 0;
  }

  async paginate(
    workspaceId: string,
    options: {
      page?: number;
      limit?: number;
      filter?: Record<string, unknown>;
      sort?: Record<string, 1 | -1>;
    },
  ): Promise<PaginatedResult<T>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;
    const query = this.buildBaseQuery(workspaceId, options.filter);

    const [data, total] = await Promise.all([
      this.model
        .find(query)
        .sort(options.sort ?? { createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.model.countDocuments(query).exec(),
    ]);

    return {
      data: data as unknown as T[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async aggregate(pipeline: PipelineStage[]): Promise<unknown[]> {
    return this.model.aggregate(pipeline).exec();
  }

  private buildBaseQuery(
    workspaceId: string,
    additionalFilter?: Record<string, unknown>,
  ): QueryFilter<T> {
    return {
      workspaceId: this.toObjectId(workspaceId),
      deletedAt: null,
      ...additionalFilter,
    };
  }

  private handleMongoError(error: unknown): never {
    const mongoError = error as {
      code?: number;
      keyValue?: Record<string, unknown>;
    };

    if (mongoError.code === 11000) {
      const fields = Object.keys(mongoError.keyValue ?? {}).join(', ');
      throw new BadRequestException(
        `Ya existe un registro con los mismos valores en: ${fields}`,
      );
    }

    if (mongoError.code === 121) {
      throw new BadRequestException(
        'Error de validación del schema de MongoDB',
      );
    }

    throw new InternalServerErrorException(
      'Error inesperado en la base de datos',
    );
  }
}
