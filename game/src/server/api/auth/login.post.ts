import { z } from "zod";
import { lookup } from "ip-location-api";
import type { EntityManager } from "@mikro-orm/postgresql";
import { User } from "~/server/entities/user";
import { UserCharacterService, UserService } from "~/server/services/user";
import { ReferralActionService, ReferralService } from "~/server/services/referral";
import { UserBoosterService } from "~/server/services/user/user-booster.service";
import type { UserSession } from "#auth-utils";
import type { TelegramWebAppInitData } from "~/types/telegram";
import { SettingsService } from "~/server/services";

const bodySchema = z.object({
    tgInitData: z.string().min(32),
});

function isNumber(value?: string | number): value is number {
    return ((value != null)
        && (value !== "")
        && !isNaN(Number(value.toString())));
}

export default defineEventHandler(async (event) => {
    const location: { country_name: string } | undefined = {
        country_name: "Unknown",
    };
    // if (!import.meta.dev) {
    //     const ip: string | undefined = getRequestIP(event);
    //     console.log("IP", ip);

    //     if (ip === undefined) {
    //         await clearUserSession(event);

    //         throw createError({
    //             statusCode: 400,
    //             statusMessage: "IP is not found. Close the app and try again",
    //         });
    //     }

    //     location = lookup(ip);
    //     if (!location || !location.country_name) {
    //         throw createError({
    //             statusCode: 400,
    //             statusMessage: "Location is not found. Close the app and try again",
    //         });
    //     }
    // } else {
    //     location = {
    //         country_name: "Egypt",
    //     };
    // }

    const bodyResult = bodySchema.safeParse(await readBody(event));
    if (!bodyResult.success) {
        await clearUserSession(event);

        throw createError({
            statusCode: 400,
            statusMessage: "Invalid body parameters",
            data: bodyResult.error,
        });
    }

    const body = bodyResult.data;
    if (body.tgInitData === undefined) {
        await clearUserSession(event);

        throw createError({
            statusCode: 400,
            statusMessage: "tgInitData is required",
        });
    }

    const telegramBotToken: string | undefined = process.env["TELEGRAM_BOT_TOKEN"];
    if (telegramBotToken === undefined) {
        await clearUserSession(event);

        throw createError({
            statusCode: 500,
            statusMessage: "Telegram BotToken is required. Please contact support",
            fatal: true,
        });
    }

    if (!validateTelegramData(telegramBotToken, body.tgInitData)) {
        await clearUserSession(event);

        throw createError({
            statusCode: 400,
            statusMessage: "Telegram data is invalid. Close the app and try again",
        });
    }

    const tgData = <TelegramWebAppInitData>queryStringToJson(body.tgInitData);
    if (tgData.user === undefined) {
        await clearUserSession(event);

        throw createError({
            statusCode: 400,
            statusMessage: "Telegram user data is required. Close the app and try again",
        });
    }

    if (tgData.user.is_bot !== undefined && tgData.user.is_bot) {
        await clearUserSession(event);

        throw createError({
            statusCode: 400,
            statusMessage: "Telegram user cannot be a bot",
        });
    }

    // Check auth_date is within last 5 minutes
    if (!import.meta.dev) {
        if (tgData.auth_date === undefined
            || Math.abs(Math.floor(Date.now() / 1000) - parseInt(tgData.auth_date)) > 5 * 60) {
            await clearUserSession(event);

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

    if (tgData.start_param !== undefined && !isNumber(tgData.start_param)) {
        await clearUserSession(event);

        throw createError({
            statusCode: 400,
            statusMessage: "Telegram start_param is invalid",
        });
    }

    let user: User | null = await em.findOne(User, { telegramId: tgData.user.id });
    if (user === null) {
        user = await userService.create(
            tgData.user.id,
            location.country_name,
            tgData.user.first_name,
            tgData.user.last_name,
            tgData.user.username,
            tgData.user.photo_url,
            tgData.start_param,
        );
    } else {
        // Update user
        user.country = location.country_name;
        user.firstName = tgData.user.first_name;
        user.lastName = tgData.user.last_name;
        user.username = tgData.user.username;
        userService.setPhotoUrl(user, tgData.user.photo_url ?? "");
    }

    if (user.isBanned) {
        await clearUserSession(event);

        throw createError({
            statusCode: 403,
            statusMessage: "User is banned",
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
