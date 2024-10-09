import type { EntityManager } from "@mikro-orm/postgresql";
import type { UserService } from "./user.service";
import type { UserBooster } from "~/server/entities/user/user-booster.entity";
import { ClickPowerLevelBooster, EnergyLimitLevelBooster } from "~/server/entities/boosters";
import { BoosterType } from "~/types";

export class UserBoosterService {
    constructor(
        private readonly em: EntityManager,
    ) {}

    public async create(userBooster: UserBooster): Promise<UserBooster> {
        await this.em.persistAndFlush(userBooster);
        return userBooster;
    }

    public async delete(userBooster: UserBooster): Promise<void> {
        await this.em.removeAndFlush(userBooster);
    }

    public async update(userBooster: UserBooster): Promise<void> {
        await this.em.persistAndFlush(userBooster);
    }

    /**
     * Levels up a user's booster and updates their balance if necessary.
     *
     * @param userBooster The user's booster to level up
     * @param boosterType The type of booster to level up
     * @param userService User service to update balance if want to chargeup user for level up
     */
    public async levelUp(
        userBooster: UserBooster,
        boosterType: BoosterType,
        userService: UserService | null,
    ): Promise<void> {
        if (boosterType === BoosterType.EnergyLimit) {
            await this.em.populate(userBooster, ["owner", "energyLimit.level"]);

            const nextLevel: EnergyLimitLevelBooster | null = await this.em.getRepository(EnergyLimitLevelBooster).findOne(
                { level: userBooster.energyLimit.level + 1 },
            );
            if (nextLevel === null) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Booster is already at max level",
                });
            }

            if (userService !== null) {
                if (nextLevel.price > userBooster.owner.balance) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: "Insufficient balance to level up booster",
                    });
                }

                userService.decreceBalance(userBooster.owner, nextLevel.price);
            }

            userBooster.energyLimit = nextLevel;
        } else if (boosterType === BoosterType.ClickPower) {
            await this.em.populate(userBooster, ["owner", "clickPower.level"]);

            const nextLevel: ClickPowerLevelBooster | null = await this.em.findOne(
                ClickPowerLevelBooster,
                { level: userBooster.clickPower.level + 1 },
            );
            if (nextLevel === null) {
                throw createError({
                    statusCode: 400,
                    statusMessage: "Booster is already at max level",
                });
            }

            if (userService !== null) {
                if (nextLevel.price > userBooster.owner.balance) {
                    throw createError({
                        statusCode: 400,
                        statusMessage: "Insufficient balance to level up booster",
                    });
                }

                userService.decreceBalance(userBooster.owner, nextLevel.price);
            }

            userBooster.clickPower = nextLevel;
        } else {
            throw createError({
                statusCode: 400,
                statusMessage: "Invalid booster type",
            });
        }

        await this.update(userBooster);
    }
}
