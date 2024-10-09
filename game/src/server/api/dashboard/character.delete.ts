import type { EntityManager } from "@mikro-orm/postgresql";
import { Character } from "~/server/entities/character";
import { User } from "~/server/entities/user";
import { CharacterService } from "~/server/services/character";
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

    // Get max rank character
    const maxRankCharacters: Character[] = await em.find(
        Character,
        { },
        { orderBy: { rank: "DESC" }, limit: 1 },
    );

    if (maxRankCharacters.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "No characters found",
        });
    }

    const maxRankCharacter: Character = maxRankCharacters[0];
    if (maxRankCharacter.rank === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Cannot delete character with rank 0",
        });
    }

    const characterService = new CharacterService(em);
    await characterService.delete(maxRankCharacter);

    return { success: true };
});
