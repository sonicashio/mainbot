import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { UserLevel, User } from "~/server/entities/user";
import { UserLevelService } from "~/server/services/user";
import { UserRole } from "~/types";

const bodySchema = z.object({
    level: z.number().min(0, { message: "Level must be a positive number" }),
    name: z.string().min(1, { message: "Name is required" }).max(64, { message: "Name must not exceed 64 characters" }),
    balanceReward: z.number().min(0, { message: "Balance Reward must be a positive number" }),
    requiredBalance: z.number().min(0, { message: "Required Balance must be a positive number" }),
    profitPerHour: z.number().min(0, { message: "Profit Per Hour must be a positive number" }),
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

    const body = bodyResult.data as unknown as UserLevel;
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

    // Get user level
    const levelToEdit: UserLevel | null = await em.findOne(UserLevel, { level: body.level });
    if (levelToEdit === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Level not found",
        });
    }

    // Get Previous level
    const previousLevel: UserLevel | null = await em.findOne(
        UserLevel,
        { level: levelToEdit.level - 1 },
    );
    if (previousLevel === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Previous level not found",
        });
    }

    if (previousLevel.requiredBalance >= body.requiredBalance) {
        throw createError({
            statusCode: 400,
            statusMessage: "Required balance must be higher than previous level",
        });
    }

    // Get Next level
    const nextLevel: UserLevel | null = await em.findOne(UserLevel, { level: levelToEdit.level + 1 });
    if (nextLevel !== null) {
        if (nextLevel.requiredBalance < body.requiredBalance) {
            throw createError({
                statusCode: 400,
                statusMessage: "Required balance must be lower than next level",
            });
        }
    }

    for (const update in levelToEdit) {
        if (update === "id") {
            continue;
        }

        const key = update as keyof UserLevel;
        (levelToEdit[key] as unknown) = body[key];
    }

    const userLevelService = new UserLevelService(em);
    await userLevelService.update(levelToEdit);

    return { success: true };
});
