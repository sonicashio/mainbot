import type { EntityManager } from "@mikro-orm/postgresql";
import { Settings } from "~/server/entities/settings";
import { CacheConstants } from "~/types";

export class SettingsService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(settings: Settings): Promise<Settings> {
        await this.em.persistAndFlush(settings);
        return settings;
    }

    public async delete(settings: Settings): Promise<void> {
        await this.em.removeAndFlush(settings);
    }

    public async update(settings: Settings): Promise<void> {
        await this.em.clearCache(CacheConstants.SETTINGS_KEY);
        await this.em.persistAndFlush(settings);
    }

    public async get(): Promise<Settings> {
        return await this.em.findOneOrFail(Settings, { id: 1 }, { cache: [CacheConstants.SETTINGS_KEY, 600_000] });
    }
}
