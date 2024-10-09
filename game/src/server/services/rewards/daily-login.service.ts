import type { EntityManager } from "@mikro-orm/postgresql";
import type { DailyLoginReward } from "~/server/entities/rewards";

export class DailyLoginService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(dailyLoginReward: DailyLoginReward): Promise<DailyLoginReward> {
        await this.em.persistAndFlush(dailyLoginReward);
        return dailyLoginReward;
    }

    public async delete(dailyLoginReward: DailyLoginReward | DailyLoginReward[]): Promise<void> {
        await this.em.removeAndFlush(dailyLoginReward);
    }

    public async update(dailyLoginReward: DailyLoginReward | DailyLoginReward[]): Promise<void> {
        await this.em.persistAndFlush(dailyLoginReward);
    }
}
