import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { ReferralService, ReferralActionService } from "~/server/services/referral";
import { SettingsService } from "~/server/services";
import { UserService, UserCharacterService } from "~/server/services/user";
import { UserBoosterService } from "~/server/services/user/user-booster.service";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId });
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

    await userService.claimDailyEnergyReplenishment(user);

    return { success: true };
});
