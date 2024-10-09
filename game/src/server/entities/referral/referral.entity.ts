import type { Rel } from "@mikro-orm/core";
import { Entity, PrimaryKey, ManyToOne, Property, OneToMany, Collection, Index } from "@mikro-orm/core";
import { User } from "../user";
import { ReferralAction } from "./referral-action.entity";

@Entity({ tableName: "referrals" })
export class Referral {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @ManyToOne(() => User)
    @Index()
    public referrer: Rel<User>;

    @ManyToOne(() => User)
    @Index()
    public referred: Rel<User>;

    @OneToMany(() => ReferralAction, action => action.referral)
    public readonly actions: Collection<ReferralAction>;

    @Property()
    public readonly createdAt: Date;

    constructor(referrer: Rel<User>, referred: Rel<User>) {
        this.referrer = referrer;
        this.referred = referred;
        this.actions = new Collection<ReferralAction>(this);
        this.createdAt = new Date();
    }
}
