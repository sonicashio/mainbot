import type { EntityManager } from "@mikro-orm/postgresql";
import type { EnergyLimitLevelBooster } from "~/server/entities/boosters";

export class EnergyLimitBoosterService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(energyLimitBooster: EnergyLimitLevelBooster): Promise<EnergyLimitLevelBooster> {
        await this.em.persistAndFlush(energyLimitBooster);
        return energyLimitBooster;
    }

    public async delete(energyLimitBooster: EnergyLimitLevelBooster): Promise<void> {
        await this.em.removeAndFlush(energyLimitBooster);
    }

    public async update(energyLimitBooster: EnergyLimitLevelBooster): Promise<void> {
        await this.em.persistAndFlush(energyLimitBooster);
    }
}
