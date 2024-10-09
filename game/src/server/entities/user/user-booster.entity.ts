import type { Rel } from "@mikro-orm/core";
import { Entity, PrimaryKey, ManyToOne, Index, OneToOne } from "@mikro-orm/core";
import { EnergyLimitLevelBooster } from "../boosters";
import { ClickPowerLevelBooster } from "../boosters/click-power-level-booster.entity";
import { User } from "./user.entity";

@Entity({ tableName: "user_boosters" })
export class UserBooster {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @OneToOne(() => User)
    @Index()
    public readonly owner: Rel<User>;

    @ManyToOne(() => EnergyLimitLevelBooster)
    @Index()
    public energyLimit: Rel<EnergyLimitLevelBooster>;

    @ManyToOne(() => ClickPowerLevelBooster)
    @Index()
    public clickPower: Rel<ClickPowerLevelBooster>;

    constructor(owner: Rel<User>, energyLimit: Rel<EnergyLimitLevelBooster>, clickPower: Rel<ClickPowerLevelBooster>) {
        this.owner = owner;
        this.energyLimit = energyLimit;
        this.clickPower = clickPower;
    }
}
