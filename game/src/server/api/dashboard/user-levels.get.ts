import type { EntityManager } from "@mikro-orm/postgresql";
import { User, UserLevel } from "~/server/entities/user";
import { UserRole } from "~/types";
import { UserLevelDto } from "~/types/dto/user";

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

    const userLevels: UserLevel[] = await em.findAll(UserLevel, { orderBy: { level: "ASC" } });
    return userLevels.map(UserLevelDto.fromUserLevel);
});
