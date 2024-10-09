import type { EntityDTO, EntityManager } from "@mikro-orm/postgresql";
import type { EarnTaskCompletion } from "~/server/entities/tasks";
import { EarnTask } from "~/server/entities/tasks";
import { User } from "~/server/entities/user";
import { CacheConstants } from "~/types";
import { EarnTaskDto } from "~/types/dto/earn";

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId }, { populate: ["completedEarnTasks.task"] });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    const earnTasks: EarnTask[] = await em.find(
        EarnTask,
        { userCanComplete: true },
        { cache: [CacheConstants.EARN_TASKS_KEY, 600_000], orderBy: { id: "ASC" } },
    );
    const completedEarnTasks: EntityDTO<EarnTaskCompletion>[] = user.completedEarnTasks.toArray();

    return earnTasks.map((task: EarnTask) => {
        const completedEarnTask: EntityDTO<EarnTaskCompletion> | undefined = completedEarnTasks.find(
            completedEarnTask => completedEarnTask.task.id === task.id,
        );

        return EarnTaskDto.fromEarnTask(task, completedEarnTask !== undefined);
    });
});
