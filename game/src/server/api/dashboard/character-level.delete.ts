import type { EntityManager } from "@mikro-orm/postgresql";
import { z } from "zod";
import { CharacterLevel } from "~/server/entities/character";
import { User } from "~/server/entities/user";
import { CharacterLevelService } from "~/server/services/character";
import { UserRole } from "~/types";

const querySchema = z.object({
    rank: z.coerce.number().min(0, "Rank must be 0 or greater"),
});

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const queryResult = querySchema.safeParse(getQuery(event));
    if (!queryResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid query parameters",
            data: queryResult.error,
        });
    }

    const query = queryResult.data;
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
    const maxCharacterLevels: CharacterLevel[] = await em.find(
        CharacterLevel,
        { character: { rank: query.rank } },
        { orderBy: { level: "DESC" }, limit: 1 },
    );

    if (maxCharacterLevels.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "No character levels found",
        });
    }

    const maxLevel: CharacterLevel = maxCharacterLevels[0];
    if (maxLevel.level === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Cannot delete character level 0",
        });
    }

    const characterLevelService = new CharacterLevelService(em);
    await characterLevelService.delete(maxLevel);

    return { success: true };
});
