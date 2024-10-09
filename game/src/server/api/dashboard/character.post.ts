import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { UserRole } from "~/types";
import { Character } from "~/server/entities/character";
import { CharacterService } from "~/server/services/character";

const bodySchema = z.object({
    name: z.string().min(1, { message: "Name is required" }).max(64, { message: "Name must not exceed 64 characters" }),
    price: z.number().min(1, { message: "Price must be at least 1" }),
    profitPerHour: z.number().min(0, { message: "Profit Per Hour must be a positive number" }),
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

    const alreadyExists: Character | null = await em.findOne(Character, { name: body.name });
    if (alreadyExists !== null) {
        throw createError({
            statusCode: 400,
            statusMessage: "Character with the same name already exists",
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

    const characterService = new CharacterService(em);
    await characterService.create(
        new Character(
            maxRankCharacter.rank + 1,
            body.name,
            body.price,
        ),
        body.profitPerHour,
    );

    return { success: true };
});
