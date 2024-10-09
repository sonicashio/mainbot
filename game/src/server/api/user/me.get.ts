import type { EntityManager } from "@mikro-orm/postgresql";
import { UserCharacterService, UserService, UserBoosterService } from "~/server/services/user";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { User, UserLevel } from "~/server/entities/user";
import { UserDto } from "~/types/dto/user";
import { SettingsService } from "~/server/services";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId }, { populate: ["level"] });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    const userService = new UserService(
        em,
        new SettingsService(em),
        new UserBoosterService(em),
        new ReferralService(em),
        new ReferralActionService(em),
        new UserCharacterService(em),
    );

    // Keep user up to date
    await userService.update(user);
    const syncData = await userService.syncEnergyAndClicksAndProfit(user, 0, Date.now());

    const nextLevelNumber: number = user.level.level + 1;
    const nextLevel: UserLevel | null = await em.findOne(
        UserLevel,
        { level: nextLevelNumber },
        { cache: [`user_level_${nextLevelNumber}`, 600_000] },
    );
    return {
        user: await UserDto.fromUser(em, user, nextLevel),
        profitSinceLastSync: typeof syncData === "string" ? 0 : syncData.profit,
    };
});
