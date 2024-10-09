import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { UserLevel, User } from "~/server/entities/user";
import { UserLevelService } from "~/server/services/user";
import { UserRole } from "~/types";

const bodySchema = z.object({
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

    // Check if there level with the same name
    const level: UserLevel | null = await em.findOne(UserLevel, { $or: [{ name: body.name }, { requiredBalance: body.requiredBalance }] });
    if (level !== null) {
        throw createError({
            statusCode: 400,
            statusMessage: "Level with the same name or required balance already exists",
        });
    }

    // Should never hit
    if (body.level === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "Cannot create level 0",
        });
    }

    // Get max level
    const maxLevels: UserLevel[] = await em.find(
        UserLevel,
        { },
        { orderBy: { level: "DESC" }, limit: 1 },
    );

    if (maxLevels.length === 0) {
        throw createError({
            statusCode: 400,
            statusMessage: "No levels found",
        });
    }

    const maxLevel: UserLevel = maxLevels[0];
    if (maxLevel.requiredBalance >= body.requiredBalance) {
        throw createError({
            statusCode: 400,
            statusMessage: "Required balance must be higher than previous level",
        });
    }

    const userLevelService = new UserLevelService(em);
    await userLevelService.create(new UserLevel(
        maxLevel.level + 1,
        body.name,
        body.balanceReward,
        body.requiredBalance,
        body.profitPerHour,
    ));

    return { success: true };
});
