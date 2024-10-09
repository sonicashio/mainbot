import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { UserRole } from "~/types";
import { CharacterLevel } from "~/server/entities/character";
import { CharacterLevelService } from "~/server/services/character";

const querySchema = z.object({
    rank: z.coerce.number().min(0, "Rank must be 0 or greater"),
});

const bodySchema = z.object({
    level: z.number().min(0, { message: "Level must be a positive number" }),
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

    // Get character level
    const levelToEdit: CharacterLevel | null = await em.findOne(CharacterLevel, { character: { rank: query.rank }, level: body.level });
    if (levelToEdit === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Character level not found",
        });
    }

    if (levelToEdit.level === 0 && body.price !== 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Price must be 0 for level 0",
        });
    }

    levelToEdit.price = body.price;
    levelToEdit.profitPerHour = body.profitPerHour;
    levelToEdit.profitPerHourViewOnly = body.profitPerHourViewOnly;

    const characterLevelService = new CharacterLevelService(em);
    await characterLevelService.update(levelToEdit);

    return { success: true };
});
