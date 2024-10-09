import type { EntityManager } from "@mikro-orm/postgresql";
import { UserLevel, User } from "~/server/entities/user";
import { UserLevelService } from "~/server/services/user";
import { UserRole } from "~/types";

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

    // Get max level
    const maxLevels: UserLevel[] = await em.find(
        UserLevel,
        { },
        { orderBy: { level: "DESC" }, limit: 1 },
    );

    if (maxLevels.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "No levels found",
        });
    }

    const maxLevel: UserLevel = maxLevels[0];
    if (maxLevel.level === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Cannot delete level 0",
        });
    }

    const userLevelService = new UserLevelService(em);
    await userLevelService.delete(maxLevel);

    return { success: true };
});
