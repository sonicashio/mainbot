import type { EntityManager } from "@mikro-orm/postgresql";
import type { Character } from "~/server/entities/character";
import { CharacterLevel } from "~/server/entities/character";

export class CharacterService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(character: Character, levelZeroProfit: number): Promise<Character> {
        if (levelZeroProfit < 0) {
            throw new Error("levelOneProfit must be greater than 0");
        }

        const firstLevel = new CharacterLevel(character, 0, 0, levelZeroProfit, 0);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        character.maxLevel = firstLevel;

        await this.update(character);
        return character;
    }

    public async delete(character: Character): Promise<void> {
        await this.em.nativeDelete(CharacterLevel, { character: character });
        await this.em.removeAndFlush(character);
    }

    public async update(character: Character): Promise<void> {
        await this.em.persistAndFlush(character);
    }

    public async addLevels(character: Character, levels: CharacterLevel | CharacterLevel[]): Promise<void> {
        // Check if level already exists
        const existingCharacterLevel: CharacterLevel[] = await this.em.getRepository(CharacterLevel).find(
            {
                character: character,
                level: Array.isArray(levels) ? { $in: levels.map(lvl => lvl.level) } : levels.level,
            },
        );

        if (existingCharacterLevel.length > 0) {
            throw new Error(
                "CharacterLevel already exists for levels: " + `${existingCharacterLevel.map(lvl => lvl.level).join(", ")}`,
            );
        }

        // Get max level
        const maxLevelToAdd: CharacterLevel = Array.isArray(levels)
            ? levels.reduce((prev, current) => (current.level > prev.level ? current : prev), levels[0])
            : levels;
        const dbMaxLevel: CharacterLevel = (await this.em.getRepository(CharacterLevel).find(
            { character },
            { orderBy: { level: "DESC" }, limit: 1 },
        ))[0];
        const maxLevel: CharacterLevel = maxLevelToAdd.level > dbMaxLevel.level ? maxLevelToAdd : dbMaxLevel;

        // Add levels
        character.levels.add(levels);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        character.maxLevel = maxLevel;

        await this.em.persistAndFlush(character);
    }
}
