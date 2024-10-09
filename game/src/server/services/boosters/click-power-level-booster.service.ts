import type { EntityManager } from "@mikro-orm/postgresql";
import type { ClickPowerLevelBooster } from "~/server/entities/boosters";

export class clickPowerLevelBoosterService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(clickPowerLevelBooster: ClickPowerLevelBooster): Promise<ClickPowerLevelBooster> {
        await this.em.persistAndFlush(clickPowerLevelBooster);
        return clickPowerLevelBooster;
    }

    public async delete(clickPowerLevelBooster: ClickPowerLevelBooster): Promise<void> {
        await this.em.removeAndFlush(clickPowerLevelBooster);
    }

    public async update(clickPowerLevelBooster: ClickPowerLevelBooster): Promise<void> {
        await this.em.persistAndFlush(clickPowerLevelBooster);
    }
}
