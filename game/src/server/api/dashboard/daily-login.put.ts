import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { DailyLoginReward } from "~/server/entities/rewards";
import { DailyLoginService } from "~/server/services/rewards";
import { CacheConstants, UserRole } from "~/types";

const bodySchema = z.object({
    day: z.number().min(1, { message: "Day must be a positive number" }),
    reward: z.number().min(0, { message: "Balance Reward must be a positive number" }),
    spcialDay: z.boolean(),
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

    const body = bodyResult.data;
    const em: EntityManager = useEntityManager<EntityManager>(event);

    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Current user not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is not an admin",
        });
    }

    // Get day
    const dayToEdit: DailyLoginReward | null = await em.findOne(DailyLoginReward, { day: body.day });
    if (dayToEdit === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Daily login day not found",
        });
    }

    dayToEdit.reward = body.reward;
    dayToEdit.spcialDay = body.spcialDay;

    const dailyLoginService = new DailyLoginService(em);
    await dailyLoginService.update(dayToEdit);
    await em.clearCache(CacheConstants.DAILY_LOGIN_REWARDS_KEY);

    return { success: true };
});
