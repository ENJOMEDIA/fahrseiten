import { assertTenantRecord, type TenantContext } from "./tenant-context";

export type TenantEntity = Readonly<{ id: string; tenantId: string }>;

export interface TenantRepository<T extends TenantEntity> {
  list(context: TenantContext): Promise<readonly T[]>;
  get(context: TenantContext, id: string): Promise<T | null>;
  save(context: TenantContext, entity: T): Promise<void>;
}

export class InMemoryTenantRepository<
  T extends TenantEntity,
> implements TenantRepository<T> {
  readonly #records = new Map<string, T>();

  constructor(records: readonly T[] = []) {
    for (const record of records) this.#records.set(record.id, record);
  }

  async list(context: TenantContext): Promise<readonly T[]> {
    return [...this.#records.values()].filter(
      (record) => record.tenantId === context.tenantId,
    );
  }

  async get(context: TenantContext, id: string): Promise<T | null> {
    const record = this.#records.get(id);
    if (!record || record.tenantId !== context.tenantId) return null;
    return record;
  }

  async save(context: TenantContext, entity: T): Promise<void> {
    assertTenantRecord(context, entity.tenantId);
    this.#records.set(entity.id, entity);
  }
}
