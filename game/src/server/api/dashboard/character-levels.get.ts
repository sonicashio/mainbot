import type { EntityManager } from "@mikro-orm/postgresql";
import { z } from "zod";
import { Character, CharacterLevel } from "~/server/entities/character";
import { User } from "~/server/entities/user";
import { UserRole } from "~/types";
import { CharacterLevelDto } from "~/types/dto/character";

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

    const characterLevels: CharacterLevel[] = await em.find(
        CharacterLevel,
        { character: { rank: query.rank } },
        { orderBy: { level: "ASC" } },
    );

    const maxRankCharacters: Character[] = await em.find(
        Character,
        { },
        { orderBy: { rank: "DESC" }, limit: 1 },
    );

    if (maxRankCharacters.length === 0) {
        throw createError({
            statusCode: 404,
            statusMessage: "Max rank character not found",
        });
    }

    return {
        levels: await Promise.all(characterLevels.map(cLvl => CharacterLevelDto.fromCharacterLevel(em, cLvl))),
        maxRankCharacter: maxRankCharacters[0].rank,
    };
});
