import type { EntityDTO, EntityManager } from "@mikro-orm/postgresql";
import type { CharacterLevel } from "~/server/entities/character";

export class CharacterLevelService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async delete(
        characterLevel: CharacterLevel | CharacterLevel[] | EntityDTO<CharacterLevel> | EntityDTO<CharacterLevel>[],
    ): Promise<void> {
        await this.em.removeAndFlush(characterLevel);
    }

    public async update(
        characterLevel: CharacterLevel | CharacterLevel[] | EntityDTO<CharacterLevel> | EntityDTO<CharacterLevel>[],
    ): Promise<void> {
        await this.em.persistAndFlush(characterLevel);
    }
}
