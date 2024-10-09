import type { EntityManager } from "@mikro-orm/postgresql";
import type { ReferralAction } from "~/server/entities/referral/referral-action.entity";

export class ReferralActionService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(action: ReferralAction): Promise<ReferralAction> {
        await this.em.persistAndFlush(action);
        return action;
    }

    public async delete(action: ReferralAction): Promise<void> {
        await this.em.removeAndFlush(action);
    }

    public async update(action: ReferralAction): Promise<void> {
        await this.em.persistAndFlush(action);
    }
}
