import type { EntityDTO, EntityManager } from "@mikro-orm/postgresql";
import { Character } from "~/server/entities/character";
import type { UserCharacter } from "~/server/entities/user";
import { User } from "~/server/entities/user";
import { UserCharacterDto } from "~/types/dto/user";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const em: EntityManager = useEntityManager<EntityManager>(event);

    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId }, { populate: ["ownedCharacters.character"] });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    const owned: EntityDTO<UserCharacter>[] = user.ownedCharacters.toArray();
    const characters: Character[] = await em.findAll(Character, { populate: ["levels"], cache: 600_000, orderBy: { rank: "ASC" } });
    return characters.map((character) => {
        const userCharacter: EntityDTO<UserCharacter> | undefined = owned.find(owned => owned.character.id === character.id);

        const dto = new UserCharacterDto();
        dto.unlocked = userCharacter !== undefined;
        dto.selected = user.selectedCharacter.character.id === character.id;
        dto.currentLevel = userCharacter ? userCharacter.currentLevel : 0;
        dto.rank = character.rank;
        dto.name = character.name;
        dto.price = character.price;
        dto.levels = character.levels.map(level => ({ level: level.level, price: level.price, profit: level.profitPerHourViewOnly }));
        dto.maxLevel = character.maxLevel.level;

        return dto;
    });
});
