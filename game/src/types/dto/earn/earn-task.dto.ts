import type { EarnTask } from "~/server/entities/tasks";
import { EarnTaskType } from "~/types";

export class EarnTaskDto {
    public id!: number;
    public createdAt!: number;
    public title!: string;
    public reward!: number;
    public type!: EarnTaskType;
    public url!: string | undefined;
    public count!: number | undefined;
    public completed!: boolean;

    public static fromEarnTask(task: EarnTask, completed: boolean): EarnTaskDto {
        let url: string | undefined;
        let count: number | undefined;
        switch (task.type) {
            case EarnTaskType.TELEGRAM_JOIN:
            case EarnTaskType.X_FOLLOW:
            case EarnTaskType.YOUTUBE_SUBSCRIBE:
                url = task.requirements["url"] as string;
                count = undefined;
                break;
            case EarnTaskType.INVITE_FRIENDS:
                url = undefined;
                count = task.requirements["count"] as number;
                break;
            default:
                throw createError({
                    statusCode: 500,
                    statusMessage: "Unreachable code, invalid task type",
                });
        }

        const dto = new EarnTaskDto();
        dto.id = task.id;
        dto.createdAt = task.createdAt.getTime();
        dto.title = task.title;
        dto.reward = task.reward;
        dto.type = task.type;
        dto.url = url;
        dto.count = count;
        dto.completed = completed;

        return dto;
    }
}
