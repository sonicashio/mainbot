import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { SettingsService } from "~/server/services";
import { User } from "~/server/entities/user";
import type { Settings } from "~/server/entities/settings";
import { UserRole } from "~/types";

const bodySchema = z.object({
    // Main settings
    telegramWebAppUrl: z.string()
        .min(8, { message: "Telegram web app URL must be at least 8 characters" })
        .max(255, { message: "Telegram web app URL must be at most 255 characters" }),

    telegramChannelId: z.string()
        .min(4, { message: "Telegram Channel ID must be at least 4 characters" })
        .max(64, { message: "Telegram Channel ID must be at most 64 characters" }),

    referralReward: z.number()
        .min(0, { message: "Referral Reward must be a positive number" }),

    dailyReward: z.number()
        .min(0, { message: "Daily Reward must be a positive number" }),

    // User settings
    userStartingBalance: z.number()
        .min(0, { message: "Starting Balance must be a positive number" }),

    maxDailyEnergyReplenishment: z.number()
        .min(0, { message: "Max Daily Energy Replenishment must be a positive number" }),

    maxOfflineProfitHours: z.number()
        .min(0, { message: "Max Offline Profit Hours must be a positive number" }),

    // Energy limit
    startingEnergyLimit: z.number()
        .min(0, { message: "Starting Energy Limit must be a positive number" }),

    energyLimitPerCharacter: z.number()
        .min(0, { message: "Energy Limit Per Character must be a positive number" }),

    energyLimitPerLevel: z.number()
        .min(0, { message: "Energy Limit Per Level must be a positive number" }),

    energyLimitPerBooster: z.number()
        .min(0, { message: "Energy Limit Per Booster must be a positive number" }),
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

    const body = bodyResult.data as unknown as Settings;
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

    const settingsService = new SettingsService(em);
    const settings: Settings = await settingsService.get();

    for (const update in settings) {
        if (update === "id") {
            continue;
        }

        const key = update as Exclude<keyof Settings, "id">;
        (settings[key] as unknown) = body[key];
    }

    await settingsService.update(settings);
    return { success: true };
});
