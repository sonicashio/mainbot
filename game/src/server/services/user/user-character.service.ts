import type { EntityManager } from "@mikro-orm/postgresql";
import type { UserCharacter } from "~/server/entities/user";

export class UserCharacterService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(userCharacter: UserCharacter): Promise<UserCharacter> {
        await this.em.persistAndFlush(userCharacter);
        return userCharacter;
    }

    public async delete(userCharacter: UserCharacter): Promise<void> {
        await this.em.removeAndFlush(userCharacter);
    }

    public async update(userCharacter: UserCharacter): Promise<void> {
        await this.em.persistAndFlush(userCharacter);
    }

    public async levelUp(
        userCharacter: UserCharacter,
    ): Promise<void> {
        await this.em.populate(userCharacter, ["character.levels", "character.maxLevel"]);

        if (userCharacter.currentLevel >= userCharacter.character.maxLevel.level) {
            throw createError({
                statusCode: 400,
                statusMessage: "Character is already at max level",
            });
        }

        userCharacter.currentLevel += 1;
        await this.update(userCharacter);
    }
}
