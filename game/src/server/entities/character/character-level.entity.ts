import { z } from "zod";
import type { Rel } from "@mikro-orm/core";
import { Entity, Index, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Character } from "./character.entity";

const ctorSchema = z.object({
    level: z.number().min(0),
    price: z.number().min(0),
    profitPerHour: z.number().min(0),
});

@Entity({ tableName: "character_levels" })
export class CharacterLevel {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @ManyToOne(() => Character)
    @Index()
    public readonly character: Rel<Character>;

    @Property()
    public readonly level: number;

    @Property()
    public price: number;

    @Property()
    public profitPerHour: number;

    @Property()
    public profitPerHourViewOnly: number;

    constructor(
        character: Rel<Character>,
        level: number,
        price: number,
        profitPerHour: number,
        profitPerHourViewOnly: number,
    ) {
        ctorSchema.parse({ level, price, profitPerHour, profitPerHourViewOnly });

        this.character = character;
        this.level = level;
        this.price = price;
        this.profitPerHour = profitPerHour;
        this.profitPerHourViewOnly = profitPerHourViewOnly;
    }
}
