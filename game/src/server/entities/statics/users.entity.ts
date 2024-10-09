import { Entity, PrimaryKey, Property, type Rel, Unique } from "@mikro-orm/core";
import type { User } from "~/server/entities/user";

@Entity({ tableName: "statics_users" })
export class UsersStatics {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property()
    @Unique()
    public date!: Date;

    @Property()
    public totalUsers!: number;

    @Property()
    public totalClicks!: number;

    @Property()
    public totalClicksCoins!: number;

    @Property()
    public totalCoins!: number;

    @Property()
    public avgClicksPerUser!: number;

    @Property()
    public avgCoinsPerUser!: number;

    @Property()
    public mostActiveUser!: Rel<User>;

    @Property()
    public newUsers24h!: number;

    @Property()
    public totalReferralRewards!: number;

    @Property({ type: "json" })
    public userGrowth7Day!: { date: string; count: string }[];

    @Property({ type: "json" })
    public topUsers!: { telegramId: string; balance: number }[];

    @Property({ type: "json" })
    public usersByCountry!: { country: string; count: number }[];
}
