import type { EntityManager } from "@mikro-orm/postgresql";
import type { UserLevel } from "~/server/entities/user";

export class UserLevelService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(userLevel: UserLevel): Promise<UserLevel> {
        await this.em.persistAndFlush(userLevel);
        return userLevel;
    }

    public async delete(userLevel: UserLevel): Promise<void> {
        await this.em.removeAndFlush(userLevel);
    }

    public async update(userLevel: UserLevel): Promise<void> {
        await this.em.persistAndFlush(userLevel);
    }
}
