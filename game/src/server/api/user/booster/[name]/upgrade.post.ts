import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { ReferralService, ReferralActionService } from "~/server/services/referral";
import { UserService, UserCharacterService } from "~/server/services/user";
import { UserBoosterService } from "~/server/services/user/user-booster.service";
import { BoosterType } from "~/types";
import { SettingsService } from "~/server/services";

const paramSchema = z.nativeEnum(BoosterType);

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = paramSchema.safeParse(getRouterParam(event, "name"));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

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

    const boosterType: BoosterType = bodyResult.data;
    await userService.upgradeBooster(user, boosterType);

    return { success: boosterType };
});
