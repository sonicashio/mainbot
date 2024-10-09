import { z } from "zod";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { UserCharacterService, UserService } from "~/server/services/user";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { UserBoosterService } from "~/server/services/user/user-booster.service";
import type { UserSession } from "#auth-utils";
import type { TelegramLoginWidgetUser } from "~/types/telegram";
import { SettingsService } from "~/server/services";
import { UserRole } from "~/types";

const bodySchema = z.object({
    tgInitData: z.string().min(32),
});

export default defineEventHandler(async (event) => {
    const bodyResult = bodySchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const body = bodyResult.data;
    if (body.tgInitData === undefined) {
        throw createError({
            statusCode: 400,
            statusMessage: "tgInitData is required",
        });
    }

    const telegramBotToken: string | undefined = process.env["TELEGRAM_BOT_TOKEN"];
    if (telegramBotToken === undefined) {
        throw createError({
            statusCode: 500,
            statusMessage: "Telegram BotToken is required. Please contact support",
            fatal: true,
        });
    }

    if (!validateTelegramData(telegramBotToken, body.tgInitData)) {
        throw createError({
            statusCode: 400,
            statusMessage: "Telegram data is invalid. Close the app and try again",
        });
    }

    const tgData = <TelegramLoginWidgetUser>queryStringToJson(body.tgInitData);

    // Check auth_date is within last 5 minutes
    if (!import.meta.dev) {
        if (tgData.auth_date === undefined
            || Math.abs(Math.floor(Date.now() / 1000) - parseInt(tgData.auth_date)) > 5 * 60) {
            throw createError({
                statusCode: 400,
                statusMessage: "Telegram data is out of date. Close the app and try again",
            });
        }
    }

    const em: EntityManager = useEntityManager<EntityManager>(event);
    const userService = new UserService(
        em,
        new SettingsService(em),
        new UserBoosterService(em),
        new ReferralService(em),
        new ReferralActionService(em),
        new UserCharacterService(em),
    );

    const user: User | null = await em.findOne(User, { telegramId: tgData.id });
    if (user === null) {
        throw createError({
            statusCode: 404,
            statusMessage: "User not found",
        });
    } else {
        // Update user
        user.firstName = tgData.first_name;
        user.lastName = tgData.last_name;
        user.username = tgData.username;
        userService.setPhotoUrl(user, tgData.photo_url ?? "");
    }

    if (user.isBanned) {
        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
        });
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.MODERATOR) {
        userService.setBanned(user, true);
        await userService.update(user);

        throw createError({
            statusCode: 403,
            statusMessage: "User is not an admin",
        });
    }

    // Keep user up to date
    await userService.update(user);

    const sessionData: UserSession = {
        user: {
            telegramId: user.telegramId,
            role: user.role,
            serverVersion: useRuntimeConfig(event)["serverVersion"] as number,
        },
        loggedInAt: new Date(),
    };
    await replaceUserSession(event, sessionData);

    return { success: true };
});
