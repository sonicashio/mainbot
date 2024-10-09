import { z } from "zod";
import type { Rel } from "@mikro-orm/core";
import { Collection, Entity, Enum, Index, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { UserLevel } from "./user-level.entity";
import { UserCharacter } from "./user-character.entity";
import { UserBooster } from "./user-booster.entity";
import { Referral } from "~/server/entities/referral";
import { EarnTaskCompletion } from "~/server/entities/tasks";
import { UserRole } from "~/types";

const ctorSchema = z.object({
    telegramId: z.number().min(1),
    firstName: z.string().min(1).max(64),
    lastName: z.union([z.string().length(0), z.string().min(1).max(64)]).optional(),
    username: z.union([z.string().length(0), z.string().min(1).max(64)]).optional(),
});

@Entity({ tableName: "users" })
export class User {
    @PrimaryKey({ type: "bigint", autoincrement: true })
    public readonly id!: number; // could be string type

    @Property({ version: true })
    public readonly version!: number; // Optimistic Locking

    @Property({ length: 64, nullable: false })
    @Index()
    public country: string;

    @Property({ length: 64, nullable: false })
    public firstName: string;

    @Property({ length: 64, nullable: true })
    public lastName?: string;

    @Property({ length: 64, nullable: true })
    @Index()
    public username?: string;

    @Property({ nullable: true })
    @Index()
    public readonly photoUrl?: string;

    @Enum({ items: () => UserRole, nativeEnumName: "user_role" })
    public readonly role: UserRole;

    @Property()
    public readonly isBanned: boolean;

    @Property({ columnType: "bigint" })
    @Unique()
    @Index()
    public readonly telegramId: number;

    @Property()
    public readonly createdAt: Date;

    @Property({ onUpdate: () => new Date() })
    public readonly updatedAt: Date;

    @ManyToOne(() => UserLevel)
    @Index()
    public readonly level!: Rel<UserLevel>;

    @Property({ columnType: "bigint" })
    public readonly balance: number;

    @Property()
    public readonly balancePerClick: number;

    @Property({ columnType: "bigint" })
    public totalClaimedBalance: number;

    @Property({ columnType: "bigint" })
    public totalBalanceGetFromClicks: number;

    @Property()
    public totalClicks: number;

    @Property({ type: "bigint" })
    public lastClickSyncTime: number;

    @Property()
    @Index()
    public readonly profitPerHour: number;

    @Property({ type: "bigint" })
    public lastProfitSyncTime: number;

    @OneToMany(() => UserCharacter, ownedCharacter => ownedCharacter.owner)
    public readonly ownedCharacters: Collection<UserCharacter>;

    @OneToOne(() => UserCharacter, { nullable: true })
    public selectedCharacter!: Rel<UserCharacter>;

    @OneToMany(() => Referral, referral => referral.referrer)
    public readonly referrals: Collection<Referral>;

    @Property()
    @Index()
    public referralsCount: number;

    @ManyToOne(() => Referral, { nullable: true })
    public referedBy?: Rel<Referral> | null;

    @Property()
    public totalReferralRewards: number;

    @Property()
    public readonly energy: number;

    @Property()
    public readonly energyLimit: number;

    @Property({ type: "bigint" })
    public readonly lastEnergyModifiedTime: number;

    @Property()
    public readonly dailyEnergyReplenishmentUsed: number;

    @Property({ type: "bigint", nullable: true })
    public dailyEnergyReplenishmentClaimedDayTime?: number;

    @Property()
    public readonly lastLoginRewardDay: number;

    @Property({ type: "bigint", nullable: true })
    public lastDailyLoginClaimedDayTime?: number;

    @Property({ type: "bigint", nullable: true })
    public lastDailyRewardClaimTime?: number;

    @OneToOne(() => UserBooster, booster => booster.owner, { nullable: true })
    public boosters!: Rel<UserBooster>;

    @OneToMany(() => EarnTaskCompletion, taskCompletion => taskCompletion.user)
    public readonly completedEarnTasks: Collection<EarnTaskCompletion>;

    constructor(
        telegramId: number,
        country: string,
        firstName: string,
        lastName: string | undefined,
        username: string | undefined,
        photoUrl: string | undefined,
    ) {
        ctorSchema.parse({ telegramId, firstName, lastName, username });

        const timeNow: number = Date.now();

        this.country = country;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.photoUrl = photoUrl;
        this.role = UserRole.USER;
        this.isBanned = false;
        this.telegramId = telegramId;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.balance = 0;
        this.balancePerClick = 0;
        this.totalClaimedBalance = 0;
        this.totalBalanceGetFromClicks = 0;
        this.totalClicks = 0;
        this.lastClickSyncTime = timeNow;
        this.profitPerHour = 0;
        this.lastProfitSyncTime = timeNow;
        this.ownedCharacters = new Collection<UserCharacter>(this);
        this.referrals = new Collection<Referral>(this);
        this.referralsCount = 0;
        this.totalReferralRewards = 0;
        this.energy = 0;
        this.energyLimit = 0;
        this.lastEnergyModifiedTime = timeNow;
        this.dailyEnergyReplenishmentUsed = 0;
        this.lastLoginRewardDay = 0;
        this.completedEarnTasks = new Collection<EarnTaskCompletion>(this);
    }
}
