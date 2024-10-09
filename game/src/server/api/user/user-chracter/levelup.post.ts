import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { ReferralService, ReferralActionService } from "~/server/services/referral";
import { UserService, UserCharacterService } from "~/server/services/user";
import type { UserCharacter } from "~/server/entities/user";
import { User } from "~/server/entities/user";
import { UserBoosterService } from "~/server/services/user/user-booster.service";
import { SettingsService } from "~/server/services";

const bodySchema = z.object({
    rank: z.coerce.number().min(1),
});

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = bodySchema.safeParse(await readBody(event));
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

    const body = bodyResult.data;
    const highestCharacter: UserCharacter = await userService.levelUpCharacter(user, body.rank);

    return { sucess: true, newLevel: highestCharacter.currentLevel };
});
