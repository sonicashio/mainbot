import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { UserCharacterService, UserService } from "~/server/services/user";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { UserBoosterService } from "~/server/services/user/user-booster.service";
import { TaskCompletionService } from "~/server/services/tasks/task-completion.service";
import { SettingsService } from "~/server/services";

const bodySchema = z.object({
    taskId: z.coerce.number().min(1),
});

export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = bodySchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const user: User | null = await em.findOne(User, { telegramId: session.user.telegramId });
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

    const body = bodyResult.data;
    const userService = new UserService(
        em,
        new SettingsService(em),
        new UserBoosterService(em),
        new ReferralService(em),
        new ReferralActionService(em),
        new UserCharacterService(em),
    );

    const reward: number = await userService.completeEarningTask(user, body.taskId, new TaskCompletionService(em));
    return { reward };
});
