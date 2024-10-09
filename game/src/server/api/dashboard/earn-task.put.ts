import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { CacheConstants, EarnTaskType, UserRole } from "~/types";
import { EarnTask } from "~/server/entities/tasks";
import { EarnTaskService } from "~/server/services/tasks";

// Define the base schema with shared fields, excluding type
const baseTaskSchema = z.object({
    id: z.number()
        .min(0, { message: "Invalid ID" }),

    title: z.string()
        .min(1, { message: "Title is required" })
        .max(64, { message: "Title must not exceed 64 characters" }),

    reward: z.number()
        .min(0, { message: "Reward must be a non-negative number" }),
});

// Define specific validation schemas for each task type with the discriminator
const telegramJoinSchema = baseTaskSchema.extend({
    type: z.literal(EarnTaskType.TELEGRAM_JOIN),
    url: z.string()
        .url({ message: "Invalid URL format" })
        .min(1, { message: "URL is required for Telegram Join task" }),
});

const xFollowSchema = baseTaskSchema.extend({
    type: z.literal(EarnTaskType.X_FOLLOW),
    url: z.string()
        .url({ message: "Invalid URL format" })
        .min(1, { message: "URL is required for X Follow task" }),
});

const youTubeSubscribeSchema = baseTaskSchema.extend({
    type: z.literal(EarnTaskType.YOUTUBE_SUBSCRIBE),
    url: z.string()
        .url({ message: "Invalid URL format" })
        .min(1, { message: "URL is required for YouTube Subscribe task" }),
});

const inviteFriendsSchema = baseTaskSchema.extend({
    type: z.literal(EarnTaskType.INVITE_FRIENDS),
    count: z.number()
        .min(1, { message: "Cont count must be a at least 1" })
        .max(1000, { message: "Count must not exceed 1,000" }),
});

// Create a discriminated union for task-specific validation
const taskSchema = z.discriminatedUnion("type", [
    telegramJoinSchema,
    xFollowSchema,
    youTubeSubscribeSchema,
    inviteFriendsSchema,
]);
export default defineEventHandler(async (event) => {
    const session = await requireUserSession(event);

    const bodyResult = taskSchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const body = bodyResult.data;
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

    const earnTaskToEdit: EarnTask | null = await em.findOne(EarnTask, { id: body.id });
    if (earnTaskToEdit === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "Earn task not found",
        });
    }

    earnTaskToEdit.title = body.title;
    earnTaskToEdit.reward = body.reward;
    earnTaskToEdit.type = body.type;

    switch (body.type) {
        case EarnTaskType.TELEGRAM_JOIN:
        case EarnTaskType.X_FOLLOW:
        case EarnTaskType.YOUTUBE_SUBSCRIBE:
            earnTaskToEdit.requirements["url"] = body.url;
            break;
        case EarnTaskType.INVITE_FRIENDS:
            earnTaskToEdit.requirements["count"] = body.count;
            break;
        default:
            throw createError({
                statusCode: 500,
                statusMessage: "Unreachable code, invalid task type",
            });
    }

    const earnTaskService = new EarnTaskService(em);
    await earnTaskService.update(earnTaskToEdit);
    await em.clearCache(CacheConstants.EARN_TASKS_KEY);

    return { success: true };
});
