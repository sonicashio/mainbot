import type { EntityManager } from "@mikro-orm/postgresql";
import type { ReferralAction } from "~/server/entities/referral/referral-action.entity";
import type { Referral } from "~/server/entities/referral";

export class ReferralService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(referral: Referral): Promise<Referral> {
        await this.em.persistAndFlush(referral);
        return referral;
    }

    public async delete(referral: Referral): Promise<void> {
        await this.em.removeAndFlush(referral);
    }

    public async update(referral: Referral): Promise<void> {
        await this.em.persistAndFlush(referral);
    }

    public async addAction(
        referral: Referral,
        action: ReferralAction,
    ): Promise<void> {
        if (action.referral !== referral) {
            // Code should not hit this error
            throw new Error("action.referral !== referral");
        }

        referral.actions.add(action);
        await this.update(referral);
    }
}
