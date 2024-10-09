import type { EntityManager } from "@mikro-orm/postgresql";
import { CharacterDto } from "./character.dto";
import type { CharacterLevel } from "~/server/entities/character";

export class CharacterLevelDto {
    public character!: CharacterDto;
    public level!: number;
    public price!: number;
    public profitPerHour!: number;
    public profitPerHourViewOnly!: number;

    public static async fromCharacterLevel(em: EntityManager, characterLevel: CharacterLevel): Promise<CharacterLevelDto> {
        await em.populate(characterLevel, ["character"]);

        const dto = new CharacterLevelDto();
        dto.character = await CharacterDto.fromCharacter(characterLevel.character);
        dto.level = characterLevel.level;
        dto.price = characterLevel.price;
        dto.profitPerHour = characterLevel.profitPerHour;
        dto.profitPerHourViewOnly = characterLevel.profitPerHourViewOnly;

        return dto;
    }
}
