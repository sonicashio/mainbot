import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { DailyLoginReward } from "~/server/entities/rewards";
import { DailyLoginService } from "~/server/services/rewards";
import { CacheConstants, UserRole } from "~/types";

const bodySchema = z.object({
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

    // Get last day
    const lastDays: DailyLoginReward[] = await em.find(
        DailyLoginReward,
        { },
        { orderBy: { day: "DESC" }, limit: 1 },
    );

    if (lastDays.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "No days found",
        });
    }

    const lastDay: DailyLoginReward = lastDays[0];
    const dailyLoginService = new DailyLoginService(em);
    await dailyLoginService.create(new DailyLoginReward(
        lastDay.day + 1,
        body.reward,
        body.spcialDay,
    ));
    await em.clearCache(CacheConstants.DAILY_LOGIN_REWARDS_KEY);

    return { success: true };
});
