import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ tableName: "settings" })
export class Settings {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property({ length: 255, nullable: true })
    public telegramWebAppUrl: string;

    @Property({ length: 64, nullable: true })
    public telegramChannelId: string;

    @Property()
    public userStartingBalance: number;

    @Property()
    public maxDailyEnergyReplenishment: number;

    @Property()
    public maxOfflineProfitHours: number;

    @Property()
    public referralReward: number;

    @Property()
    public dailyReward: number;

    @Property()
    public startingEnergyLimit: number;

    @Property()
    public energyLimitPerCharacter: number;

    @Property()
    public energyLimitPerLevel: number;

    @Property()
    public energyLimitPerBooster: number;

    constructor() {
        this.telegramWebAppUrl = "https://t.me/s0nicash_bot/start";
        this.telegramChannelId = "-1002217295250";
        this.userStartingBalance = 5_000;
        this.maxDailyEnergyReplenishment = 6;
        this.maxOfflineProfitHours = 3;
        this.referralReward = 5_000;
        this.dailyReward = 5_000;
        this.startingEnergyLimit = 100;
        this.energyLimitPerCharacter = 100;
        this.energyLimitPerLevel = 100;
        this.energyLimitPerBooster = 100;
    }
}
