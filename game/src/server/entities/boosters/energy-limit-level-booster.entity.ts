import { z } from "zod";
import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

const ctorSchema = z.object({
    level: z.number().min(0),
    price: z.number().min(0),
});

@Entity({ tableName: "boosters_energy_limit_levels" })
export class EnergyLimitLevelBooster {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property()
    @Unique()
    public readonly level: number;

    @Property()
    public readonly price: number;

    constructor(level: number, price: number) {
        ctorSchema.parse({ level, price });

        this.level = level;
        this.price = price;
    }
}
