import type { EntityManager } from "@mikro-orm/postgresql";
import type { EarnTaskCompletion } from "~/server/entities/tasks";

export class TaskCompletionService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(taskCompletion: EarnTaskCompletion): Promise<EarnTaskCompletion> {
        await this.em.persistAndFlush(taskCompletion);
        return taskCompletion;
    }

    public async delete(taskCompletion: EarnTaskCompletion): Promise<void> {
        await this.em.removeAndFlush(taskCompletion);
    }

    public async update(taskCompletion: EarnTaskCompletion): Promise<void> {
        await this.em.persistAndFlush(taskCompletion);
    }
}
