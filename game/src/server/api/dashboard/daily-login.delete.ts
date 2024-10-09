import type { EntityManager } from "@mikro-orm/postgresql";
import { DailyLoginReward } from "~/server/entities/rewards";
import { User } from "~/server/entities/user";
import { DailyLoginService } from "~/server/services/rewards";
import { CacheConstants, UserRole } from "~/types";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);
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
    if (lastDay.day === 1) {
        throw createError({
            statusCode: 400,
            statusMessage: "Cannot delete day 1",
        });
    }

    const dailyLoginService = new DailyLoginService(em);
    await dailyLoginService.delete(lastDay);
    await em.clearCache(CacheConstants.DAILY_LOGIN_REWARDS_KEY);

    return { success: true };
});
