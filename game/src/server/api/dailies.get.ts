import type { EntityManager } from "@mikro-orm/postgresql";
import { DailyLoginReward } from "~/server/entities/rewards";
import { SettingsService } from "~/server/services";
import type { Settings } from "~/server/entities/settings";
import { DailyLoginRewardDto } from "~/types/dto";
import { CacheConstants } from "~/types";

export default defineEventHandler(async (event) => {
    await requireUserSession(event);

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const dailies: DailyLoginReward[] = await em.findAll(
        DailyLoginReward,
        { cache: [CacheConstants.DAILY_LOGIN_REWARDS_KEY, 600_000], orderBy: { day: "ASC" } },
    );

    const dailiesDto: DailyLoginRewardDto[] = dailies.map(DailyLoginRewardDto.fromDailyLoginReward);

    const settingsService = new SettingsService(em);
    const settings: Settings = await settingsService.get();

    return {
        dailies: dailiesDto,
        dailyReward: settings.dailyReward,
    };
});
