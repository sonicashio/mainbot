import { z } from "zod";
import type { Rel } from "@mikro-orm/core";
import { Entity, PrimaryKey, ManyToOne, Property, Enum } from "@mikro-orm/core";
import { Referral } from "./referral.entity";

export enum ReferralActionType {
    SIGN_UP = "sign_up",
}

const ctorSchema = z.object({
    rewardAmount: z.number().min(0),
});

@Entity({ tableName: "referral_actions" })
export class ReferralAction {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @ManyToOne(() => Referral)
    public readonly referral!: Rel<Referral>;

    @Enum(() => ReferralActionType)
    public readonly actionType: ReferralActionType;

    @Property()
    public readonly completedAt: Date;

    @Property()
    public readonly rewardAmount: number;

    constructor(referral: Rel<Referral>, actionType: ReferralActionType, rewardAmount: number) {
        ctorSchema.parse({ rewardAmount });

        this.referral = referral;
        this.actionType = actionType;
        this.rewardAmount = rewardAmount;
        this.completedAt = new Date();
    }
}
