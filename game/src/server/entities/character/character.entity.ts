import { z } from "zod";
import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property, type Rel, Unique } from "@mikro-orm/core";
import { CharacterLevel } from "./character-level.entity";

const ctorSchema = z.object({
    rank: z.number().min(1),
    name: z.string().min(1).max(64),
    price: z.number().min(0),
});

@Entity({ tableName: "characters" })
export class Character {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property({ columnType: "smallint" })
    @Unique()
    public readonly rank: number;

    @Property({ length: 64, nullable: false })
    @Unique()
    public name: string;

    @Property()
    public price: number;

    @OneToMany(() => CharacterLevel, level => level.character)
    public readonly levels: Collection<CharacterLevel>;

    @ManyToOne(() => CharacterLevel, { nullable: true })
    public readonly maxLevel!: Rel<CharacterLevel>;

    constructor(rank: number, name: string, price: number) {
        ctorSchema.parse({ rank, name, price });

        this.rank = rank;
        this.name = name;
        this.price = price;
        this.levels = new Collection<CharacterLevel>(this);
    }
}
