import { z } from "zod";
import { Entity, PrimaryKey, Property, Enum, OneToMany, Collection } from "@mikro-orm/core";
import { EarnTaskCompletion } from "./earn-task-completion.entity";
import { EarnTaskType } from "~/types";

const ctorSchema = z.object({
    rewardAmount: z.number().min(0),
});

@Entity({ tableName: "earn_tasks" })
export class EarnTask {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property()
    public readonly createdAt: Date;

    @Property({ onUpdate: () => new Date() })
    public readonly updatedAt: Date;

    @Property({ length: 64 })
    public title: string;

    @Enum({ items: () => EarnTaskType, nativeEnumName: "earn_task_type" })
    public type: EarnTaskType;

    @Property()
    public reward: number;

    @Property({ type: "json" })
    public readonly requirements: Record<string, unknown>;

    @OneToMany(() => EarnTaskCompletion, taskCompletion => taskCompletion.task)
    public readonly completions = new Collection<EarnTaskCompletion>(this);

    @Property()
    public userCanComplete: boolean;

    constructor(title: string, type: EarnTaskType, rewardAmount: number, requirements: Record<string, unknown>) {
        ctorSchema.parse({ rewardAmount });

        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.title = title;
        this.type = type;
        this.reward = rewardAmount;
        this.requirements = requirements;
        this.completions = new Collection<EarnTaskCompletion>(this);
        this.userCanComplete = true;
    }
}
