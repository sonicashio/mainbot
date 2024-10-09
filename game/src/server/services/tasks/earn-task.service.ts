import type { EntityManager } from "@mikro-orm/postgresql";
import type { EarnTask } from "~/server/entities/tasks";

export class EarnTaskService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(earnTask: EarnTask): Promise<EarnTask> {
        await this.em.persistAndFlush(earnTask);
        return earnTask;
    }

    public async delete(earnTask: EarnTask | EarnTask[]): Promise<void> {
        await this.em.removeAndFlush(earnTask);
    }

    public async update(earnTask: EarnTask | EarnTask[]): Promise<void> {
        await this.em.persistAndFlush(earnTask);
    }
}
