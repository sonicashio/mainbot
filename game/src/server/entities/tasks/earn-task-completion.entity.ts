import { Entity, PrimaryKey, Property, ManyToOne, type Rel } from "@mikro-orm/core";
import { EarnTask } from "./earn-task.entity";
import { User } from "~/server/entities/user";

@Entity({ tableName: "task_completions" })
export class EarnTaskCompletion {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @ManyToOne(() => User)
    public readonly user: Rel<User>;

    @ManyToOne(() => EarnTask)
    public readonly task: Rel<EarnTask>;

    @Property()
    public readonly completedAt: Date;

    @Property()
    public readonly rewardAmount: number;

    constructor(user: Rel<User>, task: Rel<EarnTask>, rewardAmount: number) {
        this.user = user;
        this.task = task;
        this.completedAt = new Date();
        this.rewardAmount = rewardAmount;
    }
}
