import type { Character, CharacterLevel } from "~/server/entities/character";

export class CharacterDto {
    public rank!: number;
    public name!: string;
    public price!: number;
    public profitPerHour!: number;

    public static async fromCharacter(character: Character): Promise<CharacterDto> {
        await character.levels.load({ where: { level: 0 } });

        const levelZero: CharacterLevel | undefined = character.levels.find(level => level.level === 0);
        if (levelZero === undefined) {
            throw new Error("Character level zero not found");
        }

        const dto = new CharacterDto();
        dto.rank = character.rank;
        dto.name = character.name;
        dto.price = character.price;
        dto.profitPerHour = levelZero.profitPerHour;

        return dto;
    }
}
