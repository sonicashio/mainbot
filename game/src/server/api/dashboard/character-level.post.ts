import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { UserRole } from "~/types";
import { Character, CharacterLevel } from "~/server/entities/character";
import { CharacterService } from "~/server/services/character";

const querySchema = z.object({
    rank: z.coerce.number().min(0, "Rank must be 0 or greater"),
});

const bodySchema = z.object({
    price: z.number().min(0, { message: "Price must be a positive number" }),
    profitPerHour: z.number().min(0, { message: "Profit Per Hour must be a positive number" }),
    profitPerHourViewOnly: z.number().min(0, { message: "Profit Per Hour View Only must be a positive number" }),
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

    // Get character by rank
    const characterToAddLevel: Character | null = await em.findOne(Character, { rank: query.rank });
    if (characterToAddLevel === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Character not found",
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

    const characterLevelService = new CharacterService(em);
    await characterLevelService.addLevels(characterToAddLevel, new CharacterLevel(
        characterToAddLevel,
        maxLevel.level + 1,
        body.price,
        body.profitPerHour,
        body.profitPerHourViewOnly,
    ));

    return { success: true };
});
