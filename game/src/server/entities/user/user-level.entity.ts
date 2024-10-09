import { z } from "zod";
import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

const ctorSchema = z.object({
    level: z.number().min(0),
    name: z.string().min(1).max(64),
    balanceReward: z.number().min(0),
    requiredBalance: z.number().min(0),
    profitPerHour: z.number().min(0),
});

@Entity({ tableName: "user_levels" })
export class UserLevel {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property()
    @Unique()
    public readonly level: number;

    @Property({ length: 64, nullable: false })
    @Unique()
    public readonly name: string;

    @Property()
    public readonly balanceReward: number;

    @Property({ type: "bigint" })
    @Unique()
    public readonly requiredBalance: number;

    @Property()
    public readonly profitPerHour: number;

    constructor(
        level: number,
        name: string,
        balanceReward: number,
        requiredBalance: number,
        profitPerHour: number,
    ) {
        ctorSchema.parse({ level, name, balanceReward, requiredBalance, profitPerHour });

        this.level = level;
        this.name = name;
        this.balanceReward = balanceReward;
        this.requiredBalance = requiredBalance;
        this.profitPerHour = profitPerHour;
    }
}
