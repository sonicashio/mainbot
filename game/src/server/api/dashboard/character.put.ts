import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { UserRole } from "~/types";
import { CharacterLevel, Character } from "~/server/entities/character";
import { CharacterLevelService, CharacterService } from "~/server/services/character";

const bodySchema = z.object({
    rank: z.number().min(0, { message: "Rank must be a positive number" }),
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

    // Get character
    const characterToEdit: Character | null = await em.findOne(Character, { rank: body.rank });
    if (characterToEdit === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Character not found",
        });
    }

    const levelsToEdit: CharacterLevel[] = await em.find(CharacterLevel, { character: characterToEdit, level: 0 });
    if (levelsToEdit.length === 0) {
        throw createError({
            statusCode: 404,
            statusMessage: "Character level not found",
        });
    }

    const levelToEdit: CharacterLevel = levelsToEdit[0];
    levelToEdit.profitPerHour = body.profitPerHour;

    const characterLevelService = new CharacterLevelService(em);
    await characterLevelService.update(levelToEdit);

    characterToEdit.name = body.name;
    characterToEdit.price = body.price;

    const characterService = new CharacterService(em);
    await characterService.update(characterToEdit);

    return { success: true };
});
