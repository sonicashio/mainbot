import type { EntityManager } from "@mikro-orm/postgresql";
import { Character } from "~/server/entities/character";
import { User } from "~/server/entities/user";
import { UserRole } from "~/types";
import { CharacterDto } from "~/types/dto/character";

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

    const characters: Character[] = await em.findAll(Character, { orderBy: { id: "ASC" } });
    return await Promise.all(characters.map(CharacterDto.fromCharacter));
});
