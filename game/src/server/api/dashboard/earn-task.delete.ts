import type { EntityManager } from "@mikro-orm/postgresql";
import { z } from "zod";
import { EarnTask } from "~/server/entities/tasks";
import { User } from "~/server/entities/user";
import { EarnTaskService } from "~/server/services/tasks";
import { CacheConstants, UserRole } from "~/types";

const idsSchema = z.array(z.number().min(0, { message: "Invalid ID" }));

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = idsSchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const body: number[] = bodyResult.data;
    const em: EntityManager = useEntityManager<EntityManager>(event);

    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Current user not found",
        });
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is not an admin",
        });
    }

    const tasksToDelete: EarnTask[] = await em.find(EarnTask, { id: { $in: body } });
    if (tasksToDelete.length !== body.length) {
        throw createError({
            statusCode: 404,
            statusMessage: "Some tasks not found",
        });
    }

    // Don't ever delete tasks, just mark them as uncompletable
    for (const task of tasksToDelete) {
        task.userCanComplete = false;
    }

    const earnTaskService = new EarnTaskService(em);
    await earnTaskService.update(tasksToDelete);
    await em.clearCache(CacheConstants.EARN_TASKS_KEY);

    return { success: true };
});
