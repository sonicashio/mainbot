import { z } from "zod";
import { Entity, PrimaryKey, Property, Unique } from "@mikro-orm/core";

const ctorSchema = z.object({
    day: z.number().min(1),
    reward: z.number().min(1),
});

@Entity({ tableName: "rewards_daily_logins" })
export class DailyLoginReward {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property()
    @Unique()
    public readonly day: number;

    @Property()
    public reward: number;

    @Property()
    public spcialDay: boolean;

    constructor(day: number, reward: number, spcialDay: boolean) {
        ctorSchema.parse({ day, reward });

        this.day = day;
        this.reward = reward;
        this.spcialDay = spcialDay;
    }
}
